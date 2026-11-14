// The data an Accordion is drawn from. Its behaviour is Zag's accordion
// machine; what each framework adds is how an item's text is drawn.

export interface AccordionItem {
  /** Names the item in the value, so it has to be unique in the list. */
  value: string;
  /** The words on the row that opens it, read as a heading. */
  title: string;
  disabled?: boolean;
}

/** The level of the heading each row sits in, which the page around it decides. */
export type HeadingLevel = 2 | 3 | 4 | 5 | 6;
