---
no: "013"
name: "TuneBoard"
class: creator tool
year: 2026
status: beta
repo: "slimex200-wq/youtube-my-library"
links: {}
autopsy: null
---

### What it is

TuneBoard: a content library and AI prompt workstation for running a YouTube Shorts music channel. It archives the Suno music prompts and video prompts behind each upload, syncs the channel via the YouTube Data API, and compares performance by genre and substyle.

### The experiment

Channel operations kept hitting the same walls — forgetting the prompts behind well-performing videos, judging results by gut feeling, rewriting prompts from scratch. I built a single tool to close the loop: select a genre, get a Suno prompt plus video prompts and metadata, then feed view data back into the next pick. All LLM calls run through Claude CLI, so generation costs nothing beyond the subscription.

### Findings

The prompt-and-metadata generator became the part I actually use day to day. The analytics loop exists, but the generator alone earned its keep.
