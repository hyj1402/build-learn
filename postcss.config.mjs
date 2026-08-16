// Next.js가 CSS를 빌드할 때 Tailwind CSS 문법을 변환하도록 연결하는 PostCSS 설정입니다.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
