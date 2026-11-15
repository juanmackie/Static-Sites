---
title: "AI-Sprink: a first-draft sprinkler design in ten minutes"
description: "How I built a rules-based tool that turns an architectural plan into a reviewable sprinkler-design draft, and why a human still has to finish it."
category: products
date: 2026-11-15
updated: 2026-11-15
curated: false
draft: false
platform: site
---

Yes, the name is terrible. It started as an internal project name and never left. Then I figured more buzzwords in the title couldn't hurt.

<figure>
  <video controls preload="metadata" width="1920" height="1080" aria-label="AI-Sprink sprinkler layout demo">
    <source src="/videos/ai-sprink-overview.mp4" type="video/mp4" />
    Your browser does not support embedded video.
  </video>
  <figcaption>A short overview of AI-Sprink's sprinkler-layout workflow.</figcaption>
</figure>

Before we go further, I'm firmly on the side of AI relieving people of mundane work, not replacing them. Let humans do what humans are good at: creative, thoughtful work. I'm lucky to work around some of the best people in the industry every day. I'm almost certain our design team is overqualified for first-pass layouts, but we understand they're needed as a first step. Nobody says that out loud in our office, so I'm saying it here.

## Why sprinklers?

Most of the job is governed by rigid rules, which makes it verifiable. Anything verifiable can be done, reviewed, tested, refined and done again. That's exactly what machines are good at.

Take AS 2118.1, a standard that runs to hundreds of pages. Strip it back to first principles and, by my count, about 17 rules do the heavy lifting. The rest is long-tail edge cases, plus the occasional note that disagrees with another note.

The other half is the architect's drawing. Autodesk would love you to think a DWG is some mystical object. It's a closed format, but its sibling, DXF, is documented and readable by anyone. Support open source and open data. Get the drawing into DXF and it opens up. Zoom in far enough and even a circle is just a pile of tiny straight lines. Straight lines are easy to measure, so we lay a grid over the floor like a game of Battleships: “Is there a wall at B7?” We ask thousands of times. That maps the room, then the floor.

With the map and the rules, the software places the sprinkler heads, routes the pipe and runs the hydraulic calculations, so we don't oversize things and waste money (muda). A designer still tells it where the control valve goes and what the water supply looks like. If the supply isn't known, it makes an assumption and says so loudly on the drawing.

## Machines can try more layouts

Humans can't multitask. We slice our attention into thinner and thinner pieces and call it efficiency. I include myself, along with most of the working world. It's a fallacy.

Machines don't have that problem. The software generates and compares tens or hundreds of candidate layouts. I've told it to optimise for the fewest sprinkler heads and the least pipe. I chose that, and I might be wrong.

Here's something I learned along the way: humans have a bias for symmetry. We want everything straight and parallel. It scratches a primordial itch, but it isn't always the most efficient. So in the product I give up a little efficiency and keep the pipe straight and tidy, because people have to look at it, build it and trust it.

The efficient answer is to steal from one of the world's great engineers: Mother Nature. Evolution has been stress-testing plumbing for millions of years. I went down a rabbit hole for a few weeks and ran pipe using evolutionary, organic routing. To anyone in the industry it looked like an absolute mess. On paper, it still hit every goal I set, using less pipe. I'm not putting root systems in your ceiling, but the lesson stuck: just because something looks right to us doesn't mean it is.

## A draft, not a finished design

Add it all up and you can upload a blank architectural plan and get a first-draft sprinkler design in about ten minutes. Heads placed, pipework routed and sized, hydraulics calculated against AS 2118.1. A designer reviews and finishes it instead of starting from a blank sheet.

It is not for construction. It's a draft, and a human still signs off, in keeping with IBM's rule. When the software isn't sure, it stops and says so instead of guessing. A 1.4 mm gap in someone's drafting is enough to make it refuse.

Its first speed test was an empty 10 m box, which it passed with flying colours. Turns out empty boxes are easy. Now it can handle 2,000 sqm basements with doors, rooms and columns. We even track the number of fittings and core holes required.

This started as “Can I actually build this?” It turns out I could. It isn't public yet, and I'd love to get it in front of the right people. If you work in fire protection, or you're sitting on a pile of plans and a headache, message me. I'm especially keen to hear where you think it's wrong.

If it grows into what I hope, it will free very talented people from tasks that don't need much talent. That would mean we've moved in the right direction.

We're on the cusp of doing to the human mind what the bicycle did for human movement, everywhere.
