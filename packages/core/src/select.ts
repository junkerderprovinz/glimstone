// The select for a page without React (design-language.md, "Behaviour
// contracts"): the same Zag machine as react/Select.tsx and the same
// `.glim-select-*` rules, mounted into an empty element. A plugin page gets the
// keys, the focus handling, the groups, the wheel and the look of the React
// apps. Submenus need react/Select.tsx.
//
// Needs `@zag-js/select` and `@zag-js/vanilla`, bundled or loaded as modules,
// and ./selectScroll.ts beside it.

import * as select from '@zag-js/select';
import { normalizeProps, spreadProps, VanillaMachine } from '@zag-js/vanilla';
import { enableWheelStep, stepIndex } from './selectScroll';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** A run of options, set off by a hairline and named by its heading where it has one. */
export interface SelectGroup {
  heading?: string;
  options: SelectOption[];
}

/** As in react/Select.tsx: `fill` takes its line, `steady` is as wide as the longest option, `squeeze` is steady until the room runs out, `hug` fits the value on show. */
export type SelectWidth = 'fill' | 'steady' | 'squeeze' | 'hug';

export interface MountedSelect {
  /** Choose a value without firing onChange. */
  setValue: (value: string) => void;
  /** Stop the machine and take the list off the body. */
  destroy: () => void;
}

// The chevron and the check of glyphs.json, IconExpand and IconCheck.
const EXPAND =
  '<svg width="14" height="14" viewBox="3.6 2.95 12.8 12.8" fill="currentColor" aria-hidden="true"><path d="M10 13.4 3.6 7l1.7-1.7L10 10l4.7-4.7L16.4 7 10 13.4Z"/></svg>';
const CHECK =
  '<svg width="14" height="14" viewBox="0.3 0.549 13.399 13.399" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M4.381 12.219 L4.574 12.378 L4.793 12.497 L5.032 12.572 L5.155 12.592 L5.405 12.596 L5.651 12.552 L5.884 12.461 L6.096 12.328 L6.278 12.157 L13.457 3.957 L13.584 3.736 L13.666 3.495 L13.699 3.242 L13.683 2.988 L13.656 2.863 L13.566 2.625 L13.431 2.408 L13.257 2.222 L13.05 2.074 L12.936 2.016 L12.695 1.934 L12.442 1.901 L12.188 1.917 L11.942 1.983 L11.713 2.096 L11.511 2.251 L5.238 9.399 L2.519 6.681 L2.425 6.595 L2.213 6.454 L1.977 6.356 L1.854 6.325 L1.6 6.3 L1.346 6.325 L1.223 6.356 L0.987 6.454 L0.775 6.595 L0.595 6.775 L0.454 6.987 L0.399 7.103 L0.325 7.346 L0.3 7.6 L0.306 7.727 L0.356 7.977 L0.399 8.097 L0.519 8.322 L0.681 8.519Z"/></svg>';

const WIDTH: Record<SelectWidth, string> = {
  fill: '',
  steady: 'glim-select--steady',
  squeeze: 'glim-select--squeeze',
  hug: 'glim-select--hug',
};

export function mountSelect(
  root: HTMLElement,
  opts: {
    id: string;
    label: string;
    /** Every choice in list order, for a list without groups. */
    options?: SelectOption[];
    groups?: SelectGroup[];
    /** Null shows the placeholder and ticks no option. */
    value: string | null;
    placeholder?: string;
    width?: SelectWidth;
    onChange?: (value: string) => void;
  },
): MountedSelect {
  const groups = opts.groups ?? [{ options: opts.options ?? [] }];
  const all = groups.flatMap((g) => g.options);
  const width = opts.width ?? 'fill';

  root.className = `glim-select ${WIDTH[width]}`.trim();
  root.innerHTML =
    '<label class="glim-field-label"></label>' +
    `<div><button type="button" class="glim-select-trigger"><span class="glim-select-value"></span><span class="glim-select-indicator">${EXPAND}</span></button></div>` +
    '<select hidden></select>';
  const label = root.querySelector('label')!;
  const control = root.querySelector('div')!;
  const trigger = root.querySelector('button')!;
  const indicator = trigger.querySelector<HTMLElement>('.glim-select-indicator')!;
  const hidden = root.querySelector('select')!;
  label.textContent = opts.label;

  // One span per label in one grid cell for the steady widths, one for the rest.
  const valueBox = trigger.querySelector('.glim-select-value')!;
  const stacked = width === 'steady' || width === 'squeeze';
  const texts = stacked ? [...new Set([opts.placeholder ?? '', ...all.map((o) => o.label)])] : [''];
  const spans = texts.map((t) => {
    const s = document.createElement('span');
    s.textContent = t;
    valueBox.appendChild(s);
    return s;
  });

  // On the body, so no card or scroll box can clip the open list.
  const positioner = document.createElement('div');
  positioner.style.zIndex = '50';
  const list = document.createElement('div');
  list.className = 'glim-select-content';
  const items: HTMLElement[] = [];
  const groupParts: { box: HTMLElement; heading: HTMLElement | null; id: string }[] = [];
  groups.forEach((g, gi) => {
    if (g.options.length === 0) return;
    const box = document.createElement('div');
    box.className = 'glim-select-group';
    let heading: HTMLElement | null = null;
    if (g.heading) {
      heading = document.createElement('div');
      heading.className = 'glim-select-heading';
      heading.textContent = g.heading;
      box.appendChild(heading);
    }
    for (const o of g.options) {
      const item = document.createElement('div');
      item.className = 'glim-select-item';
      item.innerHTML = `<span class="glim-select-label"></span><span class="glim-select-check">${CHECK}</span>`;
      item.firstElementChild!.textContent = o.label;
      box.appendChild(item);
      items.push(item);
    }
    list.appendChild(box);
    groupParts.push({ box, heading, id: `${opts.id}-g${gi}` });
  });
  positioner.appendChild(list);
  document.body.appendChild(positioner);

  const collection = select.collection({
    items: all,
    itemToValue: (o) => o.value,
    itemToString: (o) => o.label,
    isItemDisabled: (o) => !!o.disabled,
  });

  // A wheel or a finger moving the page past the open list closes it, as a
  // resize does; scroll events alone do not, since the list follows its trigger
  // and a page still gliding to a trigger that just took focus would close it.
  const onMove = (e: Event) => {
    if (e.target instanceof Node && list.contains(e.target)) return;
    connect().setOpen(false);
  };
  const onResize = () => connect().setOpen(false);
  const moveOpts = { capture: true, passive: true };
  const listen = (open: boolean) => {
    if (open) {
      window.addEventListener('wheel', onMove, moveOpts);
      window.addEventListener('touchmove', onMove, moveOpts);
      window.addEventListener('resize', onResize);
    } else {
      window.removeEventListener('wheel', onMove, moveOpts);
      window.removeEventListener('touchmove', onMove, moveOpts);
      window.removeEventListener('resize', onResize);
    }
  };

  const machine = new VanillaMachine(select.machine, {
    id: opts.id,
    dir: document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr',
    collection,
    defaultValue: opts.value === null ? [] : [opts.value],
    positioning: {
      placement: 'bottom-start',
      flip: ['top-start', 'bottom-end', 'top-end'],
      gutter: 4,
      overflowPadding: 8,
      fitViewport: true,
    },
    onOpenChange: (d) => listen(d.open),
    onValueChange: (d) => d.value[0] !== undefined && opts.onChange?.(d.value[0]),
  });
  const connect = () => select.connect(machine.service, normalizeProps);

  const render = () => {
    const api = connect();
    spreadProps(root, api.getRootProps());
    spreadProps(label, api.getLabelProps());
    spreadProps(control, api.getControlProps());
    spreadProps(trigger, api.getTriggerProps());
    spreadProps(indicator, api.getIndicatorProps());
    const text = api.valueAsString || opts.placeholder || '';
    if (stacked) {
      for (const s of spans) {
        const on = s.textContent === text;
        s.classList.toggle('glim-select-ghost', !on);
        s.toggleAttribute('aria-hidden', !on);
      }
    } else spans[0].textContent = text;
    spreadProps(positioner, api.getPositionerProps());
    spreadProps(list, api.getContentProps());
    for (const g of groupParts) {
      if (!g.heading) continue;
      spreadProps(g.box, api.getItemGroupProps({ id: g.id }));
      spreadProps(g.heading, api.getItemGroupLabelProps({ htmlFor: g.id }));
    }
    items.forEach((el, i) => {
      const item = all[i];
      spreadProps(el, api.getItemProps({ item }));
      spreadProps(el.firstElementChild!, api.getItemTextProps({ item }));
      spreadProps(el.lastElementChild!, api.getItemIndicatorProps({ item }));
    });
    spreadProps(hidden, api.getHiddenSelectProps());
  };

  machine.subscribe(render);
  machine.start();
  render();

  // Rule 14: the closed trigger with focus steps through the options, skipping
  // disabled ones and stopping at both ends.
  const detachWheel = enableWheelStep(trigger, (delta) => {
    const api = connect();
    const at = all.findIndex((o) => o.value === api.value[0]);
    let next = at;
    if (at < 0) next = all.findIndex((o) => !o.disabled);
    else {
      for (;;) {
        const candidate = stepIndex(all.length, next, delta);
        if (candidate === next) return;
        next = candidate;
        if (!all[next].disabled) break;
      }
    }
    if (next >= 0 && next !== at) api.selectValue(all[next].value);
  });

  return {
    setValue: (value) => connect().setValue([value]),
    destroy: () => {
      detachWheel();
      listen(false);
      machine.stop();
      positioner.remove();
    },
  };
}
