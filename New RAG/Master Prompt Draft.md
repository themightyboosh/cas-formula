




GOAL: To help people understand how they feel about something based on what their body is telling them and how to approach based on affect theory.



This will be achieved via an app that will ask a user to sort  what their body is telling them about a particular thing and then receive feedback.

Requirements:  Must be fully responsive but mobile is the priority. Need a simple admin tool to edit contents 

Structure: 

Screen 1: Intro
	- **Feel it, Don’t Think It** Title
	- Intro Copy
	- Let's go Button

Screen 2:  The What
	-  What to Understand
	- ( Prompt for the User to Enter Their Person / Thing / Concept**)
- Functionality: We capture what's being discussed and determine if the concept is a "she/her/him/it/they" etc. for responses to make sense. 
- Once selected use AI to semantically match a lucide icon to it.


Screen 3:  The Sort
 - This screen shows the chosen icon and the 9 affects asking them to sort in a mobile friendly way. It should also include help copy (as referenced elsewhere). It should include a next button to process it.
- This screen needs to accomplish a lot - it must show and explain each affect, the THING under consideration, it's action and context. It must be visually engaging with the icon animating in and fun reactions when sorting occurs.

* Additionally I want to have subtle but animated states under the icon that gradually go from NEGATIVE COLORS AND GEOMETRIC SHAPES to POSTIVE COLORS AND GEOMETRIC SHAPES based valence:
function getAnimationState(score: number): number {
  if (score <= -29) return 1;
  if (score <= -25) return 2;
  if (score <= -21) return 3;
  if (score <= -17) return 4;
  if (score <= -13) return 5;
  if (score <= -9)  return 6;
  if (score <= -5)  return 7;
  if (score <= -1)  return 8;
  return 9; // 0, 1, 2
}


##What each animation band could feel like (high level)**

  

You can skin this however you want (colors, motion, distortion), but here’s a simple ladder from lowest to highest:

1. **State 1 (Score -32 to -29)**
    
    - Visual: very dark, low contrast, slow shrinking motion.
        
    - Mood: heavy collapse and rejection.
        
    
2. **State 2 (-28 to -25)**
    
    - Visual: still dark, slight jitter or flicker, small inward pulses.
        
    - Mood: strong aversion plus tension.
        
    
3. **State 3 (-24 to -21)**
    
    - Visual: dark background with faint movement in the edges.
        
    - Mood: clearly negative but not bottomed out.
        
    
4. **State 4 (-20 to -17)**
    
    - Visual: mid-dark, subtle swirl or drift, less collapse.
        
    - Mood: leaning negative, mixed pulls.
        
    
5. **State 5 (-16 to -13)**
    
    - Visual: neutral-dark, small central glow trying to form.
        
    - Mood: conflicted, neither all-bad nor all-okay.
        
    
6. **State 6 (-12 to -9)**
    
    - Visual: more light in the center, edges still muted.
        
    - Mood: mixed with a bit more room to breathe.
        
    
7. **State 7 (-8 to -5)**
    
    - Visual: gentle, stable motion, mid contrast.
        
    - Mood: slightly negative leaning, workable tension.
        
    
8. **State 8 (-4 to -1)**
    
    - Visual: noticeable glow, slow outward expansion.
        
    - Mood: mixed-to-soft-positive, cautious openness.
        
    
9. **State 9 (0 to +2)**
    
    - Visual: brightest, most open, smooth outward movement.
        
    - Mood: overall positive or strongly curious/engaged.





Screen 4:  Everything here is based on their top 3 sorts and their order (using the weighted scoring)

The results need to show a tiny CAS Element based on the top 3 in this format "CuStFe"
We need to show the object, it's name, and some small carryover of the animation at the top.

The Feeling and Approach are the important part. 
The approach always needs to be AI filtered the content should adhere super close to the original we are only modifying the object they are approaching based on AI detection. 

Include A link that says "emotional weather" that will display the Weather content.
Show the music genre button with a random song from that genre as provisioned by spotify. The query should include the genre and the user entered subject with context if possible. (be great to ideas on how to use AI to find a matching song!)

In the background where the icon sits - we need to render an AI generated image that follows the prompt. create a configurable preamble for the prompt that preceeds the image prompt content. It should say "Grayscale sketch of...." - the image should load in the backround and not prevent the screen from loading - it should fade in once discovered. All images should be cached and not regenerated if they exist.

The user should be able to start over or go to a learn more screen with a weblink.


Final Screen:

A simple screen with a link. Follow first screen design. Include a way to retake.

You just saw how your body responds to one thing.

Affect Theory can help you understand how you respond to _everything_.

Visit our site to explore how these signals can improve your clarity, connection, and well-being.

  

**Discover more →**

| Affect 1         | Affect 2         | Affect 3         | Overall Valence   | Feeling                                                 | Approach                                                                                                                                                                                                         | Weather                                                                                                                                                                               | Music Genre                                 | Image Prompt                                                                                                                                                                                                  |
| :--------------- | :--------------- | :--------------- | :---------------- | :------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Curiosity        | Joy              | Surprise–Startle | Strongly Positive | exploratory radiant layered with startled depth         | Mirror your Curiosity about the world. Let **Joy** help you celebrate what you find. But stay grounded—**Surprise–Startle** is there as a reminder of the real. Don't push it away, just let it sit.             | Bright, shifting skies with variable winds, interrupted by warm, golden sunshine, with a lingering trace of sudden flashes of lightning in a clear sky.                               | Synth Pop / Indie Pop                       | Surrealism style: A complex, fractal-like structure expanding outward, merging with a radiant burst of warm, golden light, with a hidden detail of a glitch-art distortion breaking a clean pattern.          |


| CAS Affect       | CAS Element | CAS Description                     | Tomkins Analog        | Bodily Signature                                 | Purpose                                  | Valence  |
| ---------------- | ----------- | ----------------------------------- | --------------------- | ------------------------------------------------ | ---------------------------------------- | -------- |

This screen needs to show (using the elemental)



## **1) Intro Copy – What Affect Is & What We’re Doing Here**

  

**Feel it, Don’t Think It** helps you understand how your body reacts to something in your life.

We use _affect_ - the fast, automatic signals your body sends before thoughts or explanations show up.

These signals can tell you a lot about how you truly feel about a person, place, idea, or situation.

  

To begin, tell us **the thing you want to understand better**.

Your body already knows the truth. We’re just helping you listen to it.

---

# **2) Prompt for the User to Enter Their Person / Thing / Concept**

  

What’s the **person, object, relationship, or situation** you want to understand your feelings toward?

Type it in below. This will be the focus of your affect reading.

  

_(User enters item.)_

---

# **3) Card-Sort Instructions – Ranking the Affects**

  

Now sort the **nine core affects** from strongest to weakest.

Trust your body, not your thoughts.

Place the affect you feel **most** toward your item at the top, and the one you feel **least** at the bottom.

  

There are no right or wrong answers.

Just notice what your body does, and sort the cards in the order that feels true.


### **Affect Sort**

- **How to sort?**
    
    Drag the cards into the order that feels true in your body.
    
- **Strongest affect?**
    
    The one you feel first or most intensely when thinking of your item.
    
- **Weakest affect?**
    
    The one that barely shows up or doesn’t matter much right now.
    
- **No right answer.**
    
    These ranks reflect your body’s signals, not logic or judgment.
    

  

### **Individual Affect Cards**

  

(Each one appears if hovered or tapped.)

- **Curiosity:** A pull forward, wanting to know more.
    
- **Joy:** Warmth, ease, or connection.
    
- **Surprise:** A quick reset or jolt.
    
- **Fear:** Tension that prepares you to protect yourself.
    
- **Anger:** A push to defend your boundaries.
    
- **Sadness:** A heaviness that points to loss or disconnection.
    
- **Disgust:** A clear inner “no,” wanting to turn away.
    
- **Pulling-Away:** The need for space or distance.
    
- **The Drop:** A sudden shrinking or dip in confidence.