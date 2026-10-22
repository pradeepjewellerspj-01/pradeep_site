import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import RollingNumber from '../market/RollingNumber';
import { PriceChange } from '../market/MarketBits';
import { FacebookLineIcon, InstagramIcon } from '../common/BrandIcons';
import { socialLinks } from '../../data/footer';
import { formatMarketDate, formatRate, marketLabel, useMarketPrices } from '../../market/useMarketPrices';

const socialIcons = { instagram: InstagramIcon, facebook: FacebookLineIcon };

/** Information strip above the header: today's gold rate and the brand's social profiles. */
export default function TopBar() {
  const market = useMarketPrices();
  const gold24 = market.get('gold24');
  const gold22 = market.get('gold22');
  const label = marketLabel(market);

  return (
    <div className="bg-stage text-ivory/75">
      <div className="container-wide flex h-[38px] items-center justify-between gap-4 font-sans text-[11px]">
        {gold24 && market.status !== 'unavailable' ? (
          <Link to="/gold-rate" className="group flex min-w-0 items-center gap-3 whitespace-nowrap" title={label.long} aria-label={`Gold rate: 24K ${formatRate(gold24.price)} per gram, ${label.long}. See today’s rates`}>
            <span className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.24em] text-champagne-soft">
              <span aria-hidden="true">✦</span> {label.short}
            </span>
            <span className="hidden text-ivory/50 md:inline">
              {market.asOf ? `Gold rate · ${formatMarketDate(market.asOf.date)}${market.asOf.session ? ` (${market.asOf.session})` : ''}` : `Gold rate today · ${formatMarketDate(market.updatedAt)}`}
            </span>
            <span aria-hidden="true" className="hidden h-3 w-px bg-ivory/20 md:inline-block" />
            <span className="flex items-center gap-2">
              <span className="text-ivory/50">24K</span>
              <RollingNumber value={gold24.price} format={formatRate} className="text-ivory" />
              <span className="text-ivory/35">/ 10 gm</span>
              <span className="hidden sm:inline">
                <PriceChange pct={gold24.changePct} className="text-[10.5px]" />
              </span>
            </span>
            {gold22 && (
              <span className="hidden items-center gap-2 lg:flex">
                <span aria-hidden="true" className="h-3 w-px bg-ivory/20" />
                <span className="text-ivory/50">22K</span>
                <RollingNumber value={gold22.price} format={formatRate} className="text-ivory" />
                <span className="text-ivory/35">/ 10 gm</span>
              </span>
            )}
            <span className="hidden items-center gap-1 text-champagne-soft transition-transform duration-300 group-hover:translate-x-0.5 xl:inline-flex">
              <span aria-hidden="true" className="mr-1 h-3 w-px bg-ivory/20" />
              Today’s rates <ArrowRight className="size-3" strokeWidth={1.6} aria-hidden="true" />
            </span>
          </Link>
        ) : (
          <span className="text-[9.5px] uppercase tracking-[0.24em] text-ivory/45">{label.long}</span>
        )}

        <div className="flex shrink-0 items-center gap-3.5">
          <span className="hidden text-[10.5px] uppercase tracking-[0.24em] text-ivory/60 sm:inline">Follow us</span>
          <ul className="flex items-center gap-4">
            {socialLinks.map(({ id, label: name, href }) => {
                const Icon = socialIcons[id];
                return (
                  <li key={id}>
                    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Pradeep Jewellers on ${name}`} className="block text-ivory/65 transition-colors hover:text-champagne-soft">
                      <Icon className="size-[19px]" />
                    </a>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
    </div>
  );
}
