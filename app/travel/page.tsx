const sections = [
  {
    label: "By Air",
    dot: "bg-sage",
    content: (
      <div className="bg-white p-6 rounded-sm">
        <p className="font-serif text-xl text-brown mb-2">Calgary International Airport (YYC)</p>
        <p className="font-sans text-brown leading-relaxed">
          The closest major airport — approximately 1 hour and 15 minutes from Canmore along the Trans-Canada Highway.
        </p>
      </div>
    ),
  },
  {
    label: "By Car",
    dot: "bg-gold",
    content: (
      <p className="font-sans text-brown leading-relaxed">
        Canmore is located on the Trans-Canada Highway (Highway 1), about 100 km west of Calgary.
        From YYC, take Highway 1 West toward Banff — Canmore is the first mountain town you'll reach.
        Detailed directions and a map link will be added here.
      </p>
    ),
  },
  {
    label: "Car Rental",
    dot: "bg-terracotta",
    content: (
      <p className="font-sans text-brown leading-relaxed">
        All major car rental agencies are available at YYC. We recommend booking early,
        especially for a long weekend. A car is strongly recommended — Canmore is a small
        mountain town and public transit from Calgary is limited.
      </p>
    ),
  },
  {
    label: "Shuttle",
    dot: "bg-lavender",
    content: (
      <p className="font-sans text-brown-light italic">
        Shuttle information from YYC to Canmore to follow.
      </p>
    ),
  },
];

export default function Travel() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col gap-12">

      <div className="flex flex-col gap-2">
        <p className="font-sans text-xs tracking-[0.3em] uppercase text-sage-dark font-semibold">Getting Here</p>
        <h1 className="font-serif italic text-4xl text-brown font-light">Travel</h1>
        <p className="font-sans text-brown leading-relaxed mt-1">Everything you need to get to Canmore, Alberta.</p>
      </div>

      <div className="flex flex-col gap-10">
        {sections.map((s) => (
          <div key={s.label} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${s.dot} shrink-0`}></div>
              <h2 className="font-sans text-xs tracking-[0.25em] uppercase font-bold text-brown">{s.label}</h2>
            </div>
            <div className="pl-5 border-l border-beige-dark">{s.content}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
