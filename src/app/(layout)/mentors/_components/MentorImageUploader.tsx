'use client';

import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
    LuUpload,
    LuX,
    LuImage,
    LuRefreshCw,
} from 'react-icons/lu';

import { useUploadImageMutation } from '@/redux/features/auth/authApi';

type Props = {
    value?: string;
    onChange?: (url: string) => void;
    onUploadingChange?: (uploading: boolean) => void;
};

const Spinner = ({
    className = 'size-5',
}: {
    className?: string;
}) => (
    <span
        className={`${className} border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin`}
    />
);

const MentorImageUploader = ({
    value = '',
    onChange,
    onUploadingChange,
}: Props) => {

    const [uploadImage] = useUploadImageMutation();

    const [uploading, setUploading] = useState(false);

    const fileRef = useRef<HTMLInputElement>(null);


    /* =====================================================
       UPLOAD
    ===================================================== */

    const handleFile = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        const file = e.target.files?.[0];

        e.target.value = '';

        if (!file) return;


        /* Validate */

        if (!file.type.startsWith('image/')) {

            toast.error('Please select an image file.');

            return;
        }


        /* Optional size validation */

        if (file.size > 5 * 1024 * 1024) {

            toast.error('Image size must be less than 5MB.');

            return;
        }


        try {

            setUploading(true);
            onUploadingChange?.(true);


            const formData = new FormData();

            formData.append('image', file);


            const res =
                await uploadImage(formData).unwrap();


            console.log('Image upload response:', res);


            /*
             * Your API currently returns:
             *
             * {
             *   data: "https://res.cloudinary.com/..."
             * }
             *
             */

            if (res?.data) {

                onChange?.(res.data);

                toast.success(
                    'Profile image uploaded successfully'
                );

            } else {

                toast.error(
                    'Image uploaded but URL was not returned.'
                );

            }

        } catch (error: any) {

            console.error(
                'Image upload error:',
                error
            );

            toast.error(
                error?.data?.message ||
                error?.error ||
                'Failed to upload image.'
            );

        } finally {

            setUploading(false);
            onUploadingChange?.(false);

        }
    };


    /* =====================================================
       REMOVE
    ===================================================== */

    const removeImage = () => {

        onChange?.('');

    };


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="flex flex-col md:flex-row gap-4">


            {/* =================================================
                LEFT - UPLOAD BOX
            ================================================= */}

            <button
                type="button"
                onClick={() =>
                    fileRef.current?.click()
                }
                disabled={uploading}
                className="
                    md:w-1/2
                    w-full
                    h-40
                    rounded-2xl
                    border
                    border-dashed
                    border-gray-200
                    bg-white
                    hover:border-gray-900
                    hover:bg-gray-50
                    transition-all
                    flex
                    flex-col
                    items-center
                    justify-center
                    gap-2
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                "
            >

                {uploading ? (

                    <>
                        <Spinner className="size-6" />

                        <span className="text-[12px] font-medium text-gray-600">
                            Uploading image…
                        </span>

                        <span className="text-[10px] text-gray-400">
                            Please wait
                        </span>
                    </>

                ) : (

                    <>

                        <div className="
                            w-10
                            h-10
                            rounded-xl
                            bg-gray-50
                            border
                            border-gray-100
                            flex
                            items-center
                            justify-center
                        ">

                            <LuUpload
                                className="size-5 text-gray-400"
                            />

                        </div>

                        <span className="text-[13px] font-medium text-gray-700">
                            Click to upload profile image
                        </span>

                        <span className="text-[10px] text-gray-400">
                            PNG, JPG or WEBP · Max 5MB
                        </span>

                    </>
                )}

            </button>


            <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={handleFile}
            />


            {/* =================================================
                RIGHT - IMAGE PREVIEW
            ================================================= */}

            <div
                className="
                    md:w-1/2
                    w-full
                    h-40
                    rounded-2xl
                    border
                    border-gray-100
                    bg-gray-50
                    p-3
                    relative
                "
            >

                {value ? (

                    <div className="relative h-full w-full overflow-hidden rounded-xl bg-white border border-gray-100">

                        {/* eslint-disable-next-line @next/next/no-img-element */}

                        <img
                            src={value}
                            alt="Mentor profile"
                            className="w-full h-full object-cover"
                        />


                        {/* Overlay */}

                        <div className="
                            absolute
                            inset-x-0
                            bottom-0
                            px-3
                            py-2
                            bg-gradient-to-t
                            from-black/60
                            to-transparent
                            flex
                            items-end
                            justify-between
                        ">

                            <span className="text-[10px] text-white font-medium">
                                Profile image
                            </span>


                            <div className="flex gap-1.5">

                                {/* Change */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        fileRef.current?.click()
                                    }
                                    disabled={uploading}
                                    className="
                                        w-7
                                        h-7
                                        rounded-lg
                                        bg-white/90
                                        text-gray-700
                                        flex
                                        items-center
                                        justify-center
                                        hover:bg-white
                                        transition
                                    "
                                    title="Change image"
                                >

                                    <LuRefreshCw size={13} />

                                </button>


                                {/* Remove */}

                                <button
                                    type="button"
                                    onClick={removeImage}
                                    disabled={uploading}
                                    className="
                                        w-7
                                        h-7
                                        rounded-lg
                                        bg-white/90
                                        text-gray-700
                                        flex
                                        items-center
                                        justify-center
                                        hover:bg-white
                                        transition
                                    "
                                    title="Remove image"
                                >

                                    <LuX size={14} />

                                </button>

                            </div>

                        </div>

                    </div>

                ) : (

                    <div className="
                        h-full
                        flex
                        flex-col
                        items-center
                        justify-center
                        text-gray-300
                        gap-2
                    ">

                        <div className="
                            w-10
                            h-10
                            rounded-xl
                            bg-white
                            border
                            border-gray-100
                            flex
                            items-center
                            justify-center
                        ">

                            <LuImage className="size-5" />

                        </div>

                        <span className="text-[11px]">
                            Image preview
                        </span>

                        <span className="text-[9px] text-gray-300">
                            Uploaded image will appear here
                        </span>

                    </div>

                )}

            </div>

        </div>
    );
};

export default MentorImageUploader;