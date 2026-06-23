import RentalBuddy from "./RentalBuddy";

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
      </div>

      {/* Flying section */}
      <div className="flex flex-col gap-4">
        <h2 className="font-handwritten text-2xl text-terracotta">flying in</h2>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-6">
            <p className="font-serif text-xl text-brown">Calgary International Airport (YYC)</p>
            <p className="font-sans text-brown-light text-base sm:text-sm mt-2 leading-relaxed">
              Your gateway to the Rockies. YYC is about 1 hour and 15 minutes from Canmore along the Trans-Canada Highway. Direct flights are available from most major North American cities.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-6">
            <p className="font-serif text-xl text-brown">No car? Take the airport shuttle</p>
            <p className="font-sans text-brown-light text-base sm:text-sm mt-2 leading-relaxed">
              A rental car is not required. FlixBus runs direct buses from the airport to Canmore a few times a day, leaving from YYC (Door 14, Bay 31). The trip takes roughly 1.5 to 2 hours, fares start around $16 CAD one way, and there&apos;s WiFi and power on board.
            </p>

            <div className="mt-4 rounded-xl bg-beige px-4 py-3 flex flex-col gap-2">
              <p className="font-sans uppercase tracking-widest text-brown font-bold text-[0.65rem]">
                Sample FlixBus departures · Calgary airport to Canmore
              </p>
              {[
                ['8:55 AM', '11:10 AM'],
                ['2:40 PM', '4:15 PM'],
                ['4:40 PM', '6:20 PM'],
              ].map(([depart, arrive]) => (
                <div key={depart} className="flex items-center gap-3 font-sans text-sm text-brown">
                  <span className="font-medium w-[4.5rem]">{depart}</span>
                  <span className="text-sage">→</span>
                  <span className="font-medium">{arrive}</span>
                </div>
              ))}
            </div>

            <p className="font-sans text-brown-light text-base sm:text-sm mt-4 leading-relaxed">
              Times and fares change, so book on FlixBus directly for current schedules, or use Busbud to compare a few other operators.
            </p>
            <div className="flex flex-col gap-1 mt-2">
              <a
                href="https://www.flixbus.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-base sm:text-sm text-sage-dark hover:text-sage transition-colors"
              >
                <span className="underline underline-offset-2">Book on FlixBus</span>{' '}
                <span className="text-sage">↗</span>
              </a>
              <a
                href="https://www.busbud.com/en-ca/bus-schedules-results/ef1bfa17-3a1c-4b19-93b8-7a1b21e1ec69/2a416399-2e1d-259f-6735-f722da6e966a?outbound_date=2026-06-26&adults=1"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-base sm:text-sm text-sage-dark hover:text-sage transition-colors"
              >
                <span className="underline underline-offset-2">Compare operators on Busbud</span>{' '}
                <span className="text-sage">↗</span>
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-6">
            <p className="font-serif text-xl text-brown">Or rent a car to explore</p>
            <p className="font-sans text-brown-light text-base sm:text-sm mt-2 leading-relaxed">
              If you want to roam beyond Canmore into Banff, Lake Louise, and the rest of the Rockies, a rental car is the easiest way to get around once you&apos;re here. All major agencies have desks at YYC. Book early; the long May weekend is peak season and cars disappear fast.
            </p>
          </div>
        </div>

        <RentalBuddy />
      </div>

      {/* Driving section */}
      <div className="flex flex-col gap-4">
        <h2 className="font-handwritten text-2xl text-sage">driving in</h2>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-6">
            <p className="font-serif text-xl text-brown">Canmore is on the Trans-Canada</p>
            <p className="font-sans text-brown-light text-base sm:text-sm mt-2 leading-relaxed">
              Driving? Canmore is about 100 km west of Calgary on Highway 1. From Calgary, head west on the Trans-Canada and Canmore is the first mountain town you&apos;ll reach before Banff. The Rockies appear on the horizon well before you arrive. Budget 1h15 to 1h30 depending on traffic, and how many times you pull over for photos.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
