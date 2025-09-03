-- 1. 새 이메일이 이미 사용 중인지 확인
SELECT email FROM auth.users WHERE email = 'campanellajuan14@gmail.com';

-- 2. 현재 사용자 확인
SELECT id, email FROM auth.users WHERE email = 'itsjeff168@gmail.com';

-- 3. 기존 사용자의 이메일 업데이트
UPDATE auth.users 
SET email = 'campanellajuan14@gmail.com', 
    email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'itsjeff168@gmail.com';

-- 4. 기존 이메일 변경 요청 정리 (있다면)
DELETE FROM email_change_requests 
WHERE current_email = 'itsjeff168@gmail.com' OR new_email = 'itsjeff168@gmail.com';