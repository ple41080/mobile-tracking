'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type LoginState = {
  error?: string
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get('username') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!username || !password) {
    return { error: 'กรุณาใส่ชื่อผู้ใช้และรหัสผ่าน' }
  }

  const supabase = await createClient()

  const { data: email, error: lookupError } = await supabase.rpc('lookup_admin_email', {
    p_username: username,
  })

  if (lookupError || !email) {
    return { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    return { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'เข้าสู่ระบบไม่สำเร็จ ลองใหม่อีกครั้ง' }
  }

  const { data: adminRow, error: adminError } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (adminError || !adminRow) {
    await supabase.auth.signOut()
    return { error: 'บัญชีนี้ไม่มีสิทธิ์ admin' }
  }

  redirect('/dashboard')
}
