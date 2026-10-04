// The problem flow on the home page: four services, one tainted value.
//
// The page ships the last frame (the value has reached the SQL sink, the whole route is red), so
// without JavaScript, or under prefers-reduced-motion, that is what you see. Otherwise the value
// moves one service every 1.1 s: each box and arrow turns red as it is reached, the last box
// fills at the sink, and the full route holds for two beats before it starts again. The button
// pauses and resumes; the animation also rests while it is off screen.
//
// Markup (index.html): [data-flow] holds [data-status], [data-toggle], and in order the
// [data-svc] boxes (each with data-label) and the [data-edge] arrows between them.

const STEP_MS = 1100;
const HOLD_STEPS = 2;
const REDUCE = '(prefers-reduced-' + 'motion: reduce)';

function setup(root) {
  const services = Array.from(root.querySelectorAll('[data-svc]'));
  const edges = Array.from(root.querySelectorAll('[data-edge]'));
  const status = root.querySelector('[data-status]');
  const button = root.querySelector('[data-toggle]');
  const sinkText = status.textContent;
  const last = services.length - 1;
  // steps 0..last: the value is in service n; last + 1: it reaches the sink; then hold
  const steps = last + 2 + HOLD_STEPS;
  const motion = window.matchMedia(REDUCE);
  let step = motion.matches ? last + 1 : 0;
  let playing = !motion.matches;
  let visible = true;
  let timer = 0;

  const render = () => {
    const sink = step > last;
    services.forEach((el, i) => {
      let state = 'idle';
      if (i <= Math.min(step, last)) state = 'reached';
      if (i === step) state = 'here';
      if (i === last && sink) state = 'sink';
      el.dataset.state = state;
    });
    edges.forEach((el, i) => {
      el.dataset.state = i < step ? 'on' : 'off';
    });
    status.textContent = sink ? sinkText : 'tainted value in ' + services[step].dataset.label;
    status.dataset.state = sink ? 'sink' : 'moving';
    button.textContent = playing ? 'pause' : 'play';
  };
  const sync = () => {
    const run = playing && visible && !document.hidden;
    if (run && !timer) {
      timer = setInterval(() => {
        step = (step + 1) % steps;
        render();
      }, STEP_MS);
    } else if (!run && timer) {
      clearInterval(timer);
      timer = 0;
    }
  };

  button.addEventListener('click', () => {
    playing = !playing;
    render();
    sync();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      sync();
    }).observe(root);
  }
  document.addEventListener('visibilitychange', sync);
  // reduced motion switched on: stop on the last frame (the button can still play it)
  motion.addEventListener('change', () => {
    if (!motion.matches) return;
    playing = false;
    step = last + 1;
    render();
    sync();
  });
  button.hidden = false;
  render();
  sync();
}

document.querySelectorAll('[data-flow]').forEach(setup);
