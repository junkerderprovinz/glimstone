// The select for a page without a framework (design-language.md, "Behaviour
// contracts"): the same Zag machine as the React and Vue Select and the same
// `.glim-select-*` rules, mounted into an empty element. A plugin page gets the
// keys, the focus handling, the groups, the wheel and the look of the apps.
// Submenus need a framework Select.
//
// Needs `@zag-js/select` and `@zag-js/vanilla`, bundled or loaded as modules.

import * as select from '@zag-js/select';
import { normalizeProps, spreadProps, VanillaMachine } from '@zag-js/vanilla';
import { markSvg, MARKS } from './marks.ts';
import { selectRootClass, type SelectWidth } from './selectModel.ts';
import { enableWheelStep, stepIndex } from './selectScroll.ts';

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

export interface MountedSelect {
  /** Choose a value without firing onChange. */
  setValue: (value: string) => void;
  /** Stop the machine and take the list off the body. */
  destroy: () => void;
}

const EXPAND = markSvg(MARKS.expand);
const CHECK = markSvg(MARKS.check);

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

  root.className = selectRootClass(width);
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
    } else spans[0]!.textContent = text;
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
        if (!all[next]!.disabled) break;
      }
    }
    if (next >= 0 && next !== at) api.selectValue(all[next]!.value);
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
