import Uploader from '../components/Uploader';

export default function Page() {
  return (
    <main className="max-w-7xl mx-auto py-12 px-6">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold">🗂️ ระบบจัดเก็บและแชร์ไฟล์</h1>
        <p className="opacity-80">
          อัปโหลด แชร์ และจัดการไฟล์ของคุณได้อย่างง่ายดาย
        </p>
      </header>
      <Uploader />
      <footer className="mt-16 text-xs opacity-60 text-center">
        ระบบจัดเก็บไฟล์แบบกระจาย • รองรับไฟล์ทุกประเภท • ปลอดภัยและรวดเร็ว
      </footer>
    </main>
  );
}
