"use client";

export default function Page500() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">500</h1>
        <p className="text-muted-foreground mb-6">Internal Server Error</p>
        <a href="/" className="underline">Return Home</a>
      </div>
    </div>
  );
}
