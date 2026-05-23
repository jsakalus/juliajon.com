export default function Schedule() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col gap-14">

      <div className="flex flex-col gap-2">
        <p className="font-sans text-xs tracking-[0.3em] uppercase text-gold font-semibold">The Weekend</p>
        <h1 className="font-serif italic text-4xl text-brown font-light">Schedule</h1>
        <p className="font-sans text-brown leading-relaxed mt-1">Everything you need to know about our wedding weekend.</p>
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="font-sans text-xs tracking-[0.25em] uppercase font-bold text-brown border-b border-beige-dark pb-3">
          Friday, May 28
        </h2>
        <div className="flex gap-6">
          <div className="flex flex-col items-center gap-1 mt-1">
            <div className="w-3 h-3 rounded-full bg-lavender shrink-0"></div>
            <div className="w-px flex-1 bg-beige-dark"></div>
          </div>
          <div className="pb-8">
            <p className="font-sans text-xs tracking-widest uppercase text-brown-light font-semibold mb-1">Evening</p>
            <p className="font-serif text-2xl text-brown mb-1">Welcome Dinner</p>
            <p className="font-sans text-brown">The Bear and Bison Inn · Canmore, AB</p>
            <p className="font-sans text-brown-light text-sm mt-2">By invitation only. Details to follow.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="font-sans text-xs tracking-[0.25em] uppercase font-bold text-brown border-b border-beige-dark pb-3">
          Saturday, May 29
        </h2>
        <div className="flex flex-col">
          {[
            { time: "TBD", title: "Ceremony", location: "Riverside Park · Canmore, AB", dot: "bg-mauve" },
            { time: "TBD", title: "Cocktail Hour", location: "Location TBD", dot: "bg-gold" },
            { time: "TBD", title: "Reception", location: "The Bear and Bison Inn · Canmore, AB", dot: "bg-terracotta" },
          ].map((event, i, arr) => (
            <div key={event.title} className="flex gap-6">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-3 h-3 rounded-full ${event.dot} mt-1 shrink-0`}></div>
                {i < arr.length - 1 && <div className="w-px flex-1 bg-beige-dark min-h-8"></div>}
              </div>
              <div className="pb-8">
                <p className="font-sans text-xs tracking-widest uppercase text-brown-light font-semibold mb-1">{event.time}</p>
                <p className="font-serif text-2xl text-brown mb-1">{event.title}</p>
                <p className="font-sans text-brown">{event.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
