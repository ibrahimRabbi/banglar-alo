'use client'
import React, { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { LuUpload, LuX, LuImage } from 'react-icons/lu'
import { useUploadImageMutation } from '@/redux/features/auth/authApi'

type Props = {
    value?: string[]
    onChange?: (urls: string[]) => void
    onUploadingChange?: (uploading: boolean) => void
}

const Spinner = ({ className = 'size-5' }: { className?: string }) => (
    <span className={`${className} border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin`} />
)

const ImageUploader = ({ value = [], onChange, onUploadingChange }: Props) => {
    const [uploadImage] = useUploadImageMutation()
    const [uploadingCount, setUploadingCount] = useState(0)
    const fileRef = useRef<HTMLInputElement>(null)
    const latest = useRef<string[]>(value)
    latest.current = value

    const isUploading = uploadingCount > 0

    const updateCount = (fn: (c: number) => number) =>
        setUploadingCount((c) => {
            const next = fn(c)
            onUploadingChange?.(next > 0)
            return next
        })

    const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        e.target.value = ''
        if (!files.length) return

        updateCount(() => files.length)

        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not an image`)
                updateCount((c) => c - 1)
                continue
            }
            try {
                const formData = new FormData()
                formData.append('image', file) // backend er key onujayi change koro
                const res = await uploadImage(formData).unwrap()
                if (res?.data) {
                    const next = [...latest.current, res.data]
                    latest.current = next
                    onChange?.(next)
                }
            } catch (error: any) {
                toast.error(error?.data?.message || `Failed to upload ${file.name}`)
            } finally {
                updateCount((c) => c - 1)
            }
        }
    }

    return (
        <div className='flex flex-col md:flex-row gap-4'>
            {/* Left: file input */}
            <button
                type='button'
                onClick={() => fileRef.current?.click()}
                disabled={isUploading}
                className='md:w-1/2 w-full h-40 rounded-xl border border-dashed border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition flex flex-col items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed'
            >
                {isUploading ? (
                    <>
                        <Spinner className='size-5' />
                        <span className='text-[12px] text-gray-500'>Image uploading…</span>
                    </>
                ) : (
                    <>
                        <LuUpload className='size-5 text-gray-400' />
                        <span className='text-[13px] font-medium text-gray-700'>Click to upload images</span>
                        <span className='text-[11px] text-gray-400'>PNG, JPG, WEBP · multiple allowed</span>
                    </>
                )}
            </button>
            <input ref={fileRef} type='file' accept='image/*' multiple hidden onChange={handleFiles} />

            {/* Right: preview */}
            <div className='md:w-1/2 w-full min-h-40 rounded-xl border border-gray-100 bg-gray-50 p-3'>
                {value.length === 0 && !isUploading ? (
                    <div className='h-full min-h-34 flex flex-col items-center justify-center text-gray-300 gap-1'>
                        <LuImage className='size-7' />
                        <span className='text-[11px]'>Uploaded images will appear here</span>
                    </div>
                ) : (
                    <div className='grid grid-cols-3 gap-2'>
                        {value.map((url) => (
                            <div key={url} className='relative group aspect-square rounded-lg overflow-hidden border border-gray-100 bg-white'>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt='center' className='w-full h-full object-cover' />
                                <button
                                    type='button'
                                    onClick={() => onChange?.(value.filter((i) => i !== url))}
                                    className='absolute top-1 right-1 size-5 rounded-full bg-gray-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition'
                                >
                                    <LuX className='size-3' />
                                </button>
                            </div>
                        ))}
                        {Array.from({ length: uploadingCount }).map((_, i) => (
                            <div key={`l-${i}`} className='aspect-square rounded-lg border border-dashed border-gray-200 bg-white flex items-center justify-center'>
                                <Spinner />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ImageUploader