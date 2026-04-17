import { createUploadthing, type FileRouter } from 'uploadthing/server'

const f = createUploadthing()

export const uploadRouter = {
  requisitoPersonal: f({
    pdf: { maxFileSize: '4MB', maxFileCount: 1 },
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  }).onUploadComplete(({ file }) => {
    return { url: file.ufsUrl }
  }),

  evidenciaHabilitacion: f({
    pdf: { maxFileSize: '8MB', maxFileCount: 5 },
    image: { maxFileSize: '8MB', maxFileCount: 5 },
  }).onUploadComplete(({ file }) => {
    return { url: file.ufsUrl }
  }),

  documentoSGC: f({
    pdf: { maxFileSize: '8MB', maxFileCount: 1 },
  }).onUploadComplete(({ file }) => {
    return { url: file.ufsUrl }
  }),
} satisfies FileRouter

export type OurFileRouter = typeof uploadRouter
