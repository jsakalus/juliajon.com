export default function Registry() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col gap-12">

      <div className="flex flex-col gap-2">
        <p className="font-sans text-xs tracking-[0.3em] uppercase text-gold font-semibold">Gifts</p>
        <h1 className="font-serif italic text-4xl text-brown font-light">Registry</h1>
        <p className="font-sans text-brown leading-relaxed mt-1">
          Your presence at our wedding is the greatest gift of all. If you'd like to give a gift,
          we are registered at the following:
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white p-6 flex items-center justify-between border-l-4 border-l-gold">
            <p className="font-serif text-lg text-brown-light italic">Registry details to follow</p>
            <span className="font-sans text-xs tracking-widest uppercase text-brown-light border border-beige-dark px-4 py-2">
              View →
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
