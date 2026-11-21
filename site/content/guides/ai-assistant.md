---
title: "Your own AI assistant"
weight: 90
eyebrow: "Guide 9 — the centerpiece"
replaces: "a monthly chatbot subscription that reads everything you tell it"
description: "The models were built from everyone's data. The open ones are yours to run — on a laptop today, on something bigger if you want."
moves: ["Data", "Model", "Compute"]
---

## What you gain

Everything you type into a hosted assistant — the medical question, the contract you pasted, the message you were nervous about sending — is stored by the provider and, depending on the terms you accepted, may be used to improve their models. A local model runs on your own hardware. The conversation happens in your house and ends there.

You also get an assistant that reads *your* documents, notes and photos without uploading them anywhere, works without an internet connection, and never changes its behavior because of a pricing decision in someone's boardroom.

## Be honest about the trade

Local models are smaller than the hosted frontier ones. For everyday use — writing, summarizing, answering questions, helping with code, searching your own files — a good 8–14 billion-parameter model is already excellent. For the hardest reasoning tasks, the hosted giants still win. Most people end up with both: local for daily life and anything private, hosted for the occasional heavy lift. That's a fine place to be.

## The tools (all free)

- **Ollama** or **LM Studio** — one install, pick a model, start chatting. LM Studio has a friendly window; Ollama is a tiny background service other apps talk to.
- **Open WebUI** — a chat website that runs on your box, talks to Ollama, and gives you the familiar chat experience with your own documents attached. Works from your phone over your private mesh.
- **Home Assistant** can use your local model as the brain behind voice commands.

## Which model

This changes monthly, so ask the assistant (prompt below) to check current options. The shape of the answer: with **8 GB** of memory, a 3–4 billion-parameter model; with **16 GB**, 7–8 billion; with **32 GB** or a Mac with shared memory, 12–14 billion and up; with a **GPU of 16–24 GB**, 20–30 billion at speed. Prefer models with permissive, open licenses.

## The big-model route: memory instead of graphics cards

The largest open models now rival the hosted giants, and most of them are built as a **mixture of experts**: hundreds of billions of parameters in total, but only a small slice of them works on each word. That changes the shopping list. What matters is having enough memory to *hold* the whole model, and enough memory speed to stream the active slice for every word. A used server with hundreds of gigabytes of ordinary RAM — the kind businesses retire every few years — can run a model that would need a rack of graphics cards to run fast.

The honest version: it's slow but private. Expect a few words per second, about the pace of reading aloud, and long waits before the first word when you hand it a big document. It's for the questions you'd rather not send anywhere and can afford to wait for, not for chatting. A single graphics card added to the server helps a lot. And the server's power draw belongs in the plan: a big box idles at the power of a small space heater turned low.

## Talk to it: one voice for the whole house

The same box can hear and speak. A **household speech server** turns speech into text and text into speech for every device at home. The smart-home voice assistant uses it. So can a read-aloud button for long articles, transcripts of your voice memos, or captions for family videos. None of the audio leaves the house. The free pieces are mature: Whisper for listening, Piper or Kokoro for speaking, and Home Assistant's voice pipeline to tie them to the house.

One rule worth writing down before you start: some speech models can copy a voice from a short sample. Only ever use your own voice, or the voice of someone who said yes and knows what it's for.

## What you still rent

A hosted assistant for the hard problems, if you want one — ideally under a paid plan whose terms say your conversations aren't used for training. Read that line before you rely on it.


{{% deep %}}
## Under the hood

- **Size vs memory**: at the usual 4-bit quantization (`Q4_K_M` GGUF) a model needs roughly 0.6 bytes per parameter plus room for context — about 5 GB for an 8B model, 9 GB for 14B, 18–20 GB for a 27–32B. Speed is mostly memory bandwidth: tokens per second ≈ bandwidth ÷ model size. That's why a Mac mini's unified memory punches above its weight and why a GPU's VRAM bandwidth makes 30B models conversational.
- **Runners**: Ollama (llama.cpp underneath, easiest), llama.cpp's own server (most control), LM Studio (friendliest desktop app), vLLM (GPU, many users at once). **Front-ends**: Open WebUI adds the chat page, multiple users, document upload with retrieval, and optional web search — point it at Ollama and reach it from your phone over the mesh VPN.
- **Licenses matter**: Apache-2.0 and MIT weights are yours without conditions; Llama's community license and Gemma's terms have use restrictions. Read the model card.
- **The hybrid, done right**: route by sensitivity, not by laziness. Anything personal, medical, legal or about your household goes local; the hard reasoning problem goes to the hosted model. On the hosted side, paid API access and team/business plans typically carry no-training terms that consumer chat plans don't — check the exact page.
- **GPUs, honestly**: a 16 GB card runs 12–14B models at speed; 24 GB (a used RTX 3090 is the classic value pick) runs 27–32B at 4-bit. Idle power matters more than peak — a GPU box at rest still draws a fridge's worth.
- **Beyond chat**: vision-language models let your photo library be searched by description; Home Assistant can use your local model as its conversation agent.
- **Mixture-of-experts, in numbers**: the memory you need follows the *total* parameters, while speed follows the *active* ones. At 4-bit, a 400B-total model needs roughly 240 GB, a 1-trillion-parameter one about 600 GB, and the 2-trillion-plus class well over a terabyte, plus room for context. Speed is still bandwidth ÷ bytes read per word, but only the active experts are read. A 17B-active model reads about 10 GB per word, so a server socket with eight DDR4 channels (about 190 GB/s on paper, perhaps 60% of that in practice) tops out near 10 words per second. A 30B-active model gets about half that. Examples as of November 2026: Qwen3.5-397B-A17B (Apache-2.0), DeepSeek-V4-Flash at 284B total and 13B active (MIT), and gpt-oss-120b at 117B total and 5B active (Apache-2.0), which fits in 64–96 GB. Ask the assistant for the current list.
- **The hybrid trick**: llama.cpp can keep the attention layers and shared weights on a graphics card and leave the experts in system RAM (`--cpu-moe`, or `--n-cpu-moe N` to keep only some layers' experts in RAM). That makes a 16–24 GB card plus lots of RAM much faster than RAM alone, especially when reading long prompts, which is the CPU's weak spot. A newer option caches frequently used experts on the card; reported gains vary from nothing to about double, so measure it on your own machine.
- **Two-socket servers**: memory attached to the other processor is slower to reach. Either run the model on one socket's memory, or use llama.cpp's NUMA options and measure both. Fill every memory channel. Half-populated channels halve your speed.
- **The memory market**: server memory prices rose sharply through 2025 and 2026 as AI data centers bought everything. A used server is still affordable, but price the RAM before you fall in love with the chassis.
- **The speech server**: run it as a separate service that every app calls, not a copy in each app. Home Assistant talks to speech engines over the **Wyoming** protocol: wyoming-whisper (or faster-whisper) for listening, wyoming-piper for speaking, both as small containers. A fixed-phrase engine (Speech-to-Phrase) answers in under a second on a Raspberry Pi but only understands home commands. Whisper understands everything but wants a real CPU or a modest GPU for fast replies. Kokoro is a small, high-quality speech model under Apache-2.0. Voice-cloning models exist and work from seconds of audio: write down whose voices are allowed, and keep the samples as private as your passwords.
{{% /deep %}}


{{% deep title="The commands" %}}
**Ollama settings that matter** (as environment variables on the service or in the kit's compose file):

```
OLLAMA_KEEP_ALIVE=-1        # keep the model loaded instead of unloading after 5 minutes
OLLAMA_NUM_PARALLEL=2       # concurrent requests, costs memory
OLLAMA_FLASH_ATTENTION=1    # smaller KV cache on supported hardware
```

Context length is per model and defaults low; make a longer-context variant with a Modelfile:

```
FROM qwen3:4b
PARAMETER num_ctx 16384
```

`ollama create qwen3-16k -f Modelfile`. More context costs memory linearly — watch `ollama ps`.

**Your documents, searchable**: in Open WebUI, Admin → Settings → Documents, set the embedding engine to Ollama with a small embedding model (`ollama pull nomic-embed-text`), then upload files into a Knowledge collection and reference it in chat with `#`. Everything — the text, the embeddings, the index — stays on the box.

**Home Assistant as a voice for it**: Settings → Devices & services → Add → *Ollama*, URL `http://box:11434`, pick the model; then choose it as the conversation agent of a voice assistant. Ask the house what the temperature is, in your own words.

**The speech server**, as two containers on the box (Home Assistant then adds them under *Wyoming Protocol*, host `box`, ports 10300 and 10200):

```yaml
services:
  whisper:
    image: rhasspy/wyoming-whisper
    command: --model small-int8 --language en
    ports: ["10300:10300"]
    volumes: ["./whisper:/data"]
    restart: unless-stopped
  piper:
    image: rhasspy/wyoming-piper
    command: --voice en_US-lessac-medium
    ports: ["10200:10200"]
    volumes: ["./piper:/data"]
    restart: unless-stopped
```

Pin the image tags you test with. A larger Whisper model (`medium`, `large-v3`) understands more and is slower; try it on your hardware before you switch.

**A giant model on a big-memory machine** (llama.cpp's server; the model file name is an example, use the one you downloaded):

```
llama-server -m ~/models/big-moe-Q4_K_M-00001-of-00006.gguf \
  --cpu-moe --n-gpu-layers 999 --ctx-size 32768 \
  --threads 32 --host 0.0.0.0 --port 8080
```

`--cpu-moe` keeps every expert in RAM and puts the rest on the graphics card. Without a card, drop `--n-gpu-layers`. Set `--threads` to the physical cores of one socket and compare that with all cores, because on two-socket machines more is not always faster. Then point Open WebUI at `http://box:8080/v1` as an OpenAI-compatible connection. `0.0.0.0` makes it reachable from your home network and mesh; never forward the port.
{{% /deep %}}

{{< tiers
  t0="LM Studio or Ollama on the laptop you own. A 4–8B model answers in a few seconds. Nothing leaves the room."
  t1="Ollama on the small box so it's always available, slowly, to every device — or the box acts as the front door to your laptop when it's on."
  t2="A Mac mini or a 32–64 GB mini PC running a 12–14B model at comfortable speed, Open WebUI for the family, your documents indexed locally."
  t3="A discrete GPU, 20–30B models at conversational speed, a household speech server alongside — or a used server full of RAM running the giant open models slowly and privately. This is where the hobby lives."
>}}

{{< prompt >}}
I want to run an AI assistant on my own hardware instead of a hosted one, mainly for [writing / summarizing / answering questions / helping with code / searching my own documents / smart-home voice]. Hardware I have or plan to have: [computer model, memory, and graphics card if any]. Also interested in: [a voice assistant for the house / reading articles aloud / transcribing voice memos / running one of the very large open models on a big-memory machine / none of these]. Budget tier: [0 / 1 / 2 / 3 — see de-clouding.com/tiers]. Comfort: [none / some / fluent]. Operating system: [macOS / Windows / Linux].

Check the current landscape (model releases change monthly) and recommend: one easy way to run models on my machine, and two or three specific open-weight models that fit my memory, with their license and what each is good at. Be realistic about speed and about where a hosted model would still do better. Then walk me through installing, downloading a model, having my first conversation, and — if I asked for it — attaching my own documents or connecting to my smart home, one step at a time, waiting for my confirmation each time. Nothing I type should leave my machine; point out any setting that would change that.
{{< /prompt >}}
