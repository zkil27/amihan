import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

// Register once. useGSAP cleans up every tween and ScrollTrigger a
// component created when Inertia swaps the page, so nothing leaks.
gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, SplitText, useGSAP };
