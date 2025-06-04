import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 mt-24">
        <h2 className="text-3xl neue-medium">Not Found</h2>
        <p className="neue-roman">Could not find requested resource</p>
        <Link className="px-4 py-2 bg-[#7AE2CF] text-black rounded-lg" href="/">Return Home</Link>
      </div>
    </div>
  );
}
