---
title: "Lab notes"
description: "Problems I hit building one specific home lab, and what fixed them. Tier 3 territory — the guides don't assume any of this."
---

The rest of this site is written for any budget. This section is different: it's the engineering log of one particular build — a used enterprise server, a couple of GPUs, Proxmox, and a lot of evenings — kept because every one of these problems cost me hours that a search engine couldn't save, and someone else is hitting the same wall right now.

Each note follows the same shape: **symptom → cause → fix → how to make it stick**. Commands are real and were run; versions are stated because they matter. Scripts referenced here live in the [`lab/`](https://github.com/sbezos/de-clouding/tree/main/lab) folder of the site's repo.

{{% easy %}}
*These notes are deep by nature — flip the switch at the top to **Dig deep** if the rest of the site has been hiding the specifics from you.*
{{% /easy %}}

If one of these saved you time, or you found a better way, [open an issue](https://github.com/sbezos/de-clouding/issues).
