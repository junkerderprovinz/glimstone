// The select for a page without React (design-language.md, "Behaviour
// contracts"): the same Zag machine as react/Select.tsx and the same
// `.glim-select-*` rules, mounted into an empty element. A plugin page gets the
// keys, the focus handling and the look of the React apps.
//
// Needs `@zag-js/select` and `@zag-js/vanilla`, bundled or loaded as modules.

import * as select from '@zag-js/select';
import { normalizeProps, spreadProps, VanillaMachine } from '@zag-js/vanilla';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

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

export function mountSelect(
  root: HTMLElement,
  opts: {
    id: string;
    label: string;
    options: SelectOption[];
    value: string;
    placeholder?: string;
    onChange?: (value: string) => void;
  },
): MountedSelect {
  root.innerHTML =
    '<label class="glim-field-label"></label>' +
    `<div><button type="button" class="glim-select-trigger"><span></span><span class="glim-select-indicator">${EXPAND}</span></button></div>` +
    '<select hidden></select>';
  root.style.display = 'grid';
  root.style.gap = '0.375rem';
  const label = root.querySelector('label')!;
  const control = root.querySelector('div')!;
  const trigger = root.querySelector('button')!;
  const text = trigger.querySelector('span')!;
  const indicator = trigger.querySelector<HTMLElement>('.glim-select-indicator')!;
  const hidden = root.querySelector('select')!;
  label.textContent = opts.label;

  // On the body, so no card or scroll box can clip the open list.
  const positioner = document.createElement('div');
  positioner.style.zIndex = '50';
  const list = document.createElement('ul');
  list.className = 'glim-select-content';
  for (const o of opts.options) {
    const li = document.createElement('li');
    li.className = 'glim-select-item';
    li.innerHTML = `<span></span><span class="glim-select-check">${CHECK}</span>`;
    li.firstElementChild!.textContent = o.label;
    list.appendChild(li);
  }
  positioner.appendChild(list);
  document.body.appendChild(positioner);

  const collection = select.collection({
    items: opts.options,
    itemToValue: (o) => o.value,
    itemToString: (o) => o.label,
    isItemDisabled: (o) => !!o.disabled,
  });
  const machine = new VanillaMachine(select.machine, {
    id: opts.id,
    collection,
    defaultValue: [opts.value],
    positioning: { sameWidth: true, gutter: 6 },
    onValueChange: (d) => d.value[0] !== undefined && opts.onChange?.(d.value[0]),
  });

  const render = () => {
    const api = select.connect(machine.service, normalizeProps);
    spreadProps(root, api.getRootProps());
    spreadProps(label, api.getLabelProps());
    spreadProps(control, api.getControlProps());
    spreadProps(trigger, api.getTriggerProps());
    spreadProps(indicator, api.getIndicatorProps());
    text.textContent = api.valueAsString || opts.placeholder || '';
    spreadProps(positioner, api.getPositionerProps());
    spreadProps(list, api.getContentProps());
    list.querySelectorAll('li').forEach((li, i) => {
      const item = opts.options[i];
      spreadProps(li, api.getItemProps({ item }));
      spreadProps(li.firstElementChild!, api.getItemTextProps({ item }));
      spreadProps(li.lastElementChild!, api.getItemIndicatorProps({ item }));
    });
    spreadProps(hidden, api.getHiddenSelectProps());
  };

  machine.subscribe(render);
  machine.start();
  render();

  return {
    setValue: (value) => select.connect(machine.service, normalizeProps).setValue([value]),
    destroy: () => {
      machine.stop();
      positioner.remove();
    },
  };
}
