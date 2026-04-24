
echo "Cleaning up old Vercel environment variables..."
call npx vercel env rm DB_HOST production --yes
call npx vercel env rm DB_PORT production --yes
call npx vercel env rm DB_USER production --yes
call npx vercel env rm DB_PASSWORD production --yes
call npx vercel env rm DB_NAME production --yes
call npx vercel env rm BETTER_AUTH_SECRET production --yes
call npx vercel env rm BETTER_AUTH_URL production --yes
call npx vercel env rm NEXT_PUBLIC_APP_URL production --yes

echo "Setting up NEW Vercel environment variables..."

# Database
call npx vercel env add DB_HOST production "aws-1-ap-southeast-1.pooler.supabase.com"
call npx vercel env add DB_PORT production "5432"
call npx vercel env add DB_USER production "postgres.xihxdifufmlsonaegyyi"
call npx vercel env add DB_PASSWORD production "tYOLpt6uyIHl"
call npx vercel env add DB_NAME production "postgres"

# Better Auth
call npx vercel env add BETTER_AUTH_SECRET production "NzhkM2Y5ZTJmYjYwM2M0YmU4YjA1ODcyM2M1YjY5NDA3ZDAyM2M1ZTg5M2Y0YjU2YmU4YjA1ODcyM2M1YjY5NDA3ZDAyM2M1ZTg5M2Y0YjU2"

echo "---------------------------------------------------"
echo "IMPORTANT: You must manually set the following URL variables in the Vercel Dashboard or by running these commands with your ACTUAL domain:"
echo "npx vercel env add BETTER_AUTH_URL production https://your-project.vercel.app"
echo "npx vercel env add NEXT_PUBLIC_APP_URL production https://your-project.vercel.app"
echo "---------------------------------------------------"
