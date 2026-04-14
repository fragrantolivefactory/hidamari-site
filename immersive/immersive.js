const scenes = Array.from(document.querySelectorAll(".scene"));
const bgImage = document.querySelector(".story-bg img");
const progressBars = Array.from(document.querySelectorAll(".story-progress span"));
const hint = document.querySelector(".story-hint");
const soundButton = document.querySelector(".sound-button");
const prevButton = document.querySelector(".nav-prev");
const nextButton = document.querySelector(".nav-next");
const topbar = document.querySelector(".story-topbar");
const pageCount = document.querySelector(".story-pagecount");

if (scenes.length > 0 && bgImage) {
  let currentIndex = 0;
  let audioEnabled = false;
  let audioContext;

  const ensureAudioContext = () => {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioContext = new AudioContextClass();
      }
    }

    return audioContext;
  };

  const playStepTone = (direction = "next") => {
    if (!audioEnabled) {
      return;
    }

    const context = ensureAudioContext();
    if (!context) {
      return;
    }

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = direction === "next" ? 440 : 320;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.2);
  };

  const render = () => {
    scenes.forEach((scene, index) => {
      scene.classList.toggle("is-active", index === currentIndex);
    });

    progressBars.forEach((bar, index) => {
      bar.classList.toggle("is-active", index === currentIndex);
      bar.classList.toggle("is-done", index < currentIndex);
    });

    if (pageCount) {
      pageCount.textContent = `${currentIndex + 1} / ${scenes.length}`;
    }

    const activeScene = scenes[currentIndex];
    const focus = activeScene.dataset.focus || "0.5 0.5";
    const scale = activeScene.dataset.scale || "1.08";
    const tone = activeScene.dataset.tone || "amber";
    const image = activeScene.dataset.image;
    const [x, y] = focus.split(" ");

    if (image && bgImage.getAttribute("src") !== image) {
      bgImage.setAttribute("src", image);
    }

    bgImage.style.objectPosition = `${Number(x) * 100}% ${Number(y) * 100}%`;
    bgImage.style.transform = `scale(${scale})`;

    document.body.classList.remove(
      "tone-amber",
      "tone-gold",
      "tone-soft",
      "tone-mist",
      "tone-rose",
      "tone-night",
      "tone-glow",
      "tone-fade"
    );
    document.body.classList.add(`tone-${tone}`);
  };

  const goNext = () => {
    const nextIndex = Math.min(currentIndex + 1, scenes.length - 1);
    if (nextIndex !== currentIndex) {
      currentIndex = nextIndex;
      playStepTone("next");
      render();
    }
  };

  const goPrev = () => {
    const prevIndex = Math.max(currentIndex - 1, 0);
    if (prevIndex !== currentIndex) {
      currentIndex = prevIndex;
      playStepTone("prev");
      render();
    }
  };

  prevButton?.addEventListener("click", goPrev);
  nextButton?.addEventListener("click", goNext);

  topbar?.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      goNext();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    }
  });

  soundButton?.addEventListener("click", async () => {
    audioEnabled = !audioEnabled;
    soundButton.setAttribute("aria-pressed", String(audioEnabled));
    soundButton.textContent = audioEnabled ? "◉" : "◌";

    if (audioEnabled) {
      const context = ensureAudioContext();
      if (context?.state === "suspended") {
        await context.resume();
      }
      playStepTone("next");
    }
  });

  if (hint) {
    window.setTimeout(() => {
      hint.classList.add("is-hidden");
    }, 2200);
  }

  render();
}
