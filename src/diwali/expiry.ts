// The greeting is seasonal: after this (end of 11 Nov, IST) the page redirects home and the portfolio hides its link
export const DIWALI_ENDS = new Date('2026-11-12T00:00:00+05:30').getTime()

export const isDiwaliOver = () => Date.now() >= DIWALI_ENDS
