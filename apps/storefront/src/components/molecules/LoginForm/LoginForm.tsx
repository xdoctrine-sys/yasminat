'use client';
import {ApprovedBreadcrumb} from '@/components/yasminat/approved/Breadcrumb';
import {useYasminat} from '@/components/yasminat/Provider';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from '@/components/molecules/LocalizedLink/LocalizedLink';
import {useParams} from 'next/navigation';
import { useRouter, useSearchParams } from 'next/navigation';
import { FieldError, FieldValues, FormProvider, useForm, useFormContext } from 'react-hook-form';

import { Button } from '@/components/atoms';
import { Alert } from '@/components/atoms/Alert/Alert';
import { LabeledInput } from '@/components/cells';
import { login, transferCart } from '@/lib/data/customer';
import { toast } from '@/lib/helpers/toast';

import { LoginFormData, loginFormSchema } from './schema';

export const LoginForm = () => {
  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  return (
    <FormProvider {...methods}>
      <Form />
    </FormProvider>
  );
};

const Form = () => {
  const {tr}=useYasminat();
  const [isAuthError, setIsAuthError] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting }
  } = useFormContext();
  const router = useRouter();
  const params=useParams();
  const searchParams = useSearchParams();
  const isSessionExpired = searchParams.get('sessionExpired') === 'true';
  const isSessionRequired = searchParams.get('sessionRequired') === 'true';

  const submit = async (data: FieldValues) => {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    const res = await login(formData);

    if (res.success) {
      router.push(`/${params.locale}/user`);
      await transferCart();
    } else {
      toast.error({ title: res.message || 'An error occurred. Please try again.' });
    }

    setIsAuthError(!res.success);
  };

  const clearApiError = () => {
    isAuthError && setIsAuthError(false);
  };

  const getAuthMessage = () => {
    if (isSessionExpired) {
      return 'Your session has expired. Please log in to continue.';
    }
    if (isSessionRequired) {
      return 'Please log in to continue.';
    }
    return null;
  };

  const authMessage = getAuthMessage();

  return (
    <main
      className="screen-content container"
      data-testid="login-page"
    >
      <div className="auth-layout">
        {authMessage && (
          <Alert
            title={authMessage}
            className="w-full"
            icon
            data-testid="login-auth-alert"
          />
        )}
        <div
          className="auth-content"
          data-testid="login-form-container"
        >
          <ApprovedBreadcrumb name={tr('تسجيل الدخول','Sign in')}/><div className="auth-intro"><h2>{tr('تسجيل الدخول','Sign in')}</h2><p>{tr('حيّاك في ياسمينات، ادخل بحسابك.','Welcome to Yasminat. Sign in to your account.')}</p></div>
          <form
            onSubmit={handleSubmit(submit)} className="auth-form"
            data-testid="login-form"
          >
            <div className="space-y-4">
              <LabeledInput
                label={tr('البريد الإلكتروني','E-mail')}
                placeholder={tr('بريدك الإلكتروني','Your e-mail address')}
                error={
                  (errors.email as FieldError) ||
                  (isAuthError ? ({ message: '' } as FieldError) : undefined)
                }
                data-testid="login-email-input"
                {...register('email', {
                  onChange: clearApiError
                })}
              />
              <LabeledInput
                label={tr('كلمة المرور','Password')}
                placeholder={tr('كلمة المرور','Your password')}
                type="password"
                error={
                  (errors.password as FieldError) ||
                  (isAuthError ? ({ message: '' } as FieldError) : undefined)
                }
                data-testid="login-password-input"
                {...register('password', {
                  onChange: clearApiError
                })}
              />
            </div>

            <Link
              href="/forgot-password"
              className="label-md mt-4 block text-right uppercase text-action-on-secondary"
              data-testid="login-forgot-password-link"
            >
              {tr('نسيت كلمة المرور؟','Forgot your password?')}
            </Link>

            <Button
              className="primary wide"
              disabled={isSubmitting}
              data-testid="login-submit-button"
            >
              {tr('تسجيل الدخول','Log in')}
            </Button>
          </form>
        </div>

        <div className="auth-switch">
          <h2 className="visually-hidden">
            {tr('ما عندك حساب؟',"Don't have an account yet?")}
          </h2>
          <Link
            href="/register"
            data-testid="login-register-link"
          >
            <Button
              variant="tonal"
              className="secondary wide"
            >
              {tr('إنشاء حساب','Create account')}
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
};
