import arrowUpRight from "@phosphor-icons/core/assets/regular/arrow-up-right.svg?raw";
import sun from "@phosphor-icons/core/assets/regular/sun.svg?raw";
import moon from "@phosphor-icons/core/assets/regular/moon.svg?raw";
import terminal from "@phosphor-icons/core/assets/regular/terminal-window.svg?raw";
import list from "@phosphor-icons/core/assets/regular/list.svg?raw";
import x from "@phosphor-icons/core/assets/regular/x.svg?raw";
import lock from "@phosphor-icons/core/assets/regular/lock-simple.svg?raw";

const fix = (s) => s.replace("<svg", '<svg aria-hidden="true" width="1em" height="1em"');
export const icons = {
  "arrow-up-right": fix(arrowUpRight),
  sun: fix(sun),
  moon: fix(moon),
  "terminal-window": fix(terminal),
  list: fix(list),
  x: fix(x),
  "lock-simple": fix(lock),
};
