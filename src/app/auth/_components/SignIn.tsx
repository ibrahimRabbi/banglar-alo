'use client'
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import toast from "react-hot-toast";
import { setCookie } from "cookies-next/client";
import { useForm, Controller } from "react-hook-form";
import { Input, Button, ConfigProvider } from "antd";
import { LuEye, LuEyeClosed, LuMail, LuLock } from "react-icons/lu";
import { useSignInMutation } from "@/redux/features/auth/authApi";
import Image from "next/image";
 

const SignInForm = () => {
    const query = useSearchParams()
    const redirect = query.get('redirect') || '/'
    const router = useRouter()

    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { email: '', password: '' }
    })
    const [signIn, { isLoading }] = useSignInMutation()

    const signInhandler = async (value: any) => {
        try {
            const login = await signIn(value).unwrap()
            if (login?.token) {
                toast.success('Sign-In Successfully')
                setCookie('token', login.token, {
                    maxAge: 7 * 24 * 60 * 60,
                    path: '/'
                })
                router.push(redirect)
            }
        } catch (error: any) {
            toast.error(error?.data?.message || 'something went wrong')
        }
    }

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#18181b',   // zinc-900
                    borderRadius: 0,
                    controlHeight: 40,
                },
            }}
        >
            <section className='mt-20'>
                <form
                    onSubmit={handleSubmit(signInhandler)}
                    className='lg:w-[28%] w-[90%] space-y-6 mx-auto mt-10'
                >
                    <div className='flex items-center justify-center gap-2 mt-8'>
                         <Image
                            src='https://res.cloudinary.com/dymnrefpr/image/upload/v1790859268/wptp7quzw5h8vtveeoyj.png'
                            alt='Banglar Alo Logo'
                            width={200}
                            height={40}
                            className='object-contain'
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <Controller
                            name='email'
                            control={control}
                            rules={{ required: 'email is required' }}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type='email'
                                    placeholder='type email'
                                    prefix={<LuMail className='size-4 text-zinc-400' />}
                                    status={errors.email ? 'error' : ''}
                                />
                            )}
                        />
                        {errors.email && <p className='text-red-500 text-sm'>{errors.email.message}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <Controller
                            name='password'
                            control={control}
                            rules={{
                                required: 'password is required',
                                minLength: { value: 8, message: 'password minimum 8 characters' },
                            }}
                            render={({ field }) => (
                                <Input.Password
                                    {...field}
                                    placeholder='type password'
                                    prefix={<LuLock className='size-4 text-zinc-400' />}
                                    status={errors.password ? 'error' : ''}
                                    iconRender={(visible) =>
                                        visible
                                            ? <LuEye className='size-4 cursor-pointer' />
                                            : <LuEyeClosed className='size-4 cursor-pointer' />
                                    }
                                />
                            )}
                        />
                        {errors.password && <p className='text-red-500 text-sm'>{errors.password.message}</p>}
                    </div>

                    <Button
                        type='primary'
                        htmlType='submit'
                        block
                        loading={isLoading}
                        className='!font-semibold'
                    >
                        Login
                    </Button>
                </form>
            </section>
        </ConfigProvider>
    )
}

// useSearchParams must be used inside a component that is wrapped by Suspense
const SignIn = () => (
    <Suspense fallback={<p>loading...</p>}>
        <SignInForm />
    </Suspense>
)

export default SignIn