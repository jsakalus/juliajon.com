export default function Travel() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col gap-16">

      {/* Hero */}
      <div className="text-center">
        <p className="font-handwritten text-sage text-2xl mb-0">welcome to alberta</p>
        <h1
          className="font-serif text-[2.5rem] md:text-[5rem] leading-none text-brown tracking-tight"
          style={{ fontWeight: 900 }}
        >
          GETTING HERE
        </h1>
        <p className="font-serif italic text-2xl text-brown-light mt-3">
          canmore is worth the journey
        </p>
        <p className="font-sans text-brown-light text-sm mt-4 leading-relaxed max-w-sm mx-auto">
          Most guests will fly into Calgary and drive west into the mountains. The good news: it&apos;s one of the best drives in the world.
        </p>
      </div>

      {/* Flying section */}
      <div className="flex flex-col gap-4">
        <h2 className="font-handwritten text-2xl text-terracotta">flying in</h2>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-6">
            <p className="font-serif text-xl text-brown">Calgary International Airport (YYC)</p>
            <p className="font-sans text-brown-light text-sm mt-2 leading-relaxed">
              Your gateway to the Rockies. YYC is about 1 hour and 15 minutes from Canmore along the Trans-Canada Highway. Direct flights are available from most major North American cities.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-6">
            <p className="font-serif text-xl text-brown">You&apos;ll need to rent a car</p>
            <p className="font-sans text-brown-light text-sm mt-2 leading-relaxed">
              Canmore is a small mountain town and public transit from Calgary is essentially nonexistent. If you&apos;re flying in, a rental car is not optional. All major agencies have desks at YYC. Book early; the long May weekend is peak season and cars disappear fast.
            </p>
          </div>
        </div>

        <div className="bg-sage/10 rounded-xl px-5 py-3 flex items-start gap-2 border border-sage/20">
          <span className="text-sage mt-0.5 shrink-0">✿</span>
          <p className="font-sans text-sm text-sage-dark leading-relaxed">
            We&apos;re working on a way for guests to share their arrival time so you can coordinate splitting a rental with someone else flying in around the same time. Stay tuned!
          </p>
        </div>
      </div>

      {/* Driving section */}
      <div className="flex flex-col gap-4">
        <h2 className="font-handwritten text-2xl text-sage">driving in</h2>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-6">
            <p className="font-serif text-xl text-brown">Canmore is on the Trans-Canada</p>
            <p className="font-sans text-brown-light text-sm mt-2 leading-relaxed">
              Driving? Canmore is about 100 km west of Calgary on Highway 1. From Calgary, head west on the Trans-Canada and Canmore is the first mountain town you&apos;ll reach before Banff. The Rockies appear on the horizon well before you arrive. Budget 1h15 to 1h30 depending on traffic, and how many times you pull over for photos.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
