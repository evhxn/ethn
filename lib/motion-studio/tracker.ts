// Browser-only wrapper around MediaPipe's face + pose landmarkers.
// Loaded lazily (dynamic import) so the ~10 MB wasm and models are only
// fetched when a visitor actually turns the camera on.

import type { FaceInput, PoseInput, Vec3 } from "./retarget"

const TASKS_VERSION = "1.0.1"
const WASM_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VERSION}/wasm`
const FACE_MODEL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task"
const POSE_MODEL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task"

export interface TrackerFrame {
  face: FaceInput | null
  pose: PoseInput | null
  /** Normalised image-space pose landmarks, for drawing the skeleton overlay. */
  poseImage: Vec3[] | null
  /** Normalised image-space face landmarks (a sparse subset is drawn). */
  faceImage: Vec3[] | null
}

export interface Tracker {
  detect(video: HTMLVideoElement, timestampMs: number): TrackerFrame
  close(): void
}

export async function createTracker(): Promise<Tracker> {
  const vision = await import("@mediapipe/tasks-vision")
  const fileset = await vision.FilesetResolver.forVisionTasks(WASM_BASE)

  const make = async (delegate: "GPU" | "CPU") =>
    Promise.all([
      vision.FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: FACE_MODEL, delegate },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
      }),
      vision.PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: POSE_MODEL, delegate },
        runningMode: "VIDEO",
        numPoses: 1,
      }),
    ])

  let face: Awaited<ReturnType<typeof make>>[0]
  let pose: Awaited<ReturnType<typeof make>>[1]
  try {
    ;[face, pose] = await make("GPU")
  } catch {
    ;[face, pose] = await make("CPU")
  }

  return {
    detect(video, timestampMs) {
      const f = face.detectForVideo(video, timestampMs)
      const p = pose.detectForVideo(video, timestampMs)

      let faceInput: FaceInput | null = null
      if (f.faceLandmarks.length > 0) {
        const blendshapes: Record<string, number> = {}
        for (const c of f.faceBlendshapes[0]?.categories ?? []) blendshapes[c.categoryName] = c.score
        faceInput = { matrix: f.facialTransformationMatrixes[0]?.data, blendshapes }
      }

      return {
        face: faceInput,
        pose: p.worldLandmarks.length > 0 ? { world: p.worldLandmarks[0] } : null,
        poseImage: p.landmarks[0] ?? null,
        faceImage: f.faceLandmarks[0] ?? null,
      }
    },
    close() {
      face.close()
      pose.close()
    },
  }
}
