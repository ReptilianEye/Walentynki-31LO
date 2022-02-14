# LO31 Walentynki

It's over now.

## Website performance recap

So, there was a lot of traffic.

![Worker Traffic](https://i.imgur.com/Js8ejAD.webp)

And A LOT of database operations (`list` happens once per request, `read` once per message, `write` once per heart, report, or submission)

![Worker KV database operations](https://i.imgur.com/Cfv2sRf.webp)

At peak, there was a lot of traffic - [a few request per second for short amounts of time](https://i.imgur.com/Ixm1Z0O.mp4), ~0.6 req/s average.

![Worker Request Graph](https://i.imgur.com/XUNjsqG.webp)

So many, that I had to upgrade the Workers plan to keep the website up.

![Cloudflare Usage Warning Emails](https://i.imgur.com/7AYs89r.webp)

We were also spammed with *many* reports, and had to shut that functionality down for a bit.

<details>
  <summary>Click to expand - warning, long screenshot.</summary>

![Person reporting messages](https://i.imgur.com/SYbba5h.webp)
![Message Report Notifications](https://cdn.discordapp.com/attachments/621768649212166144/942766124561485884/Screenshot_20220214-135432_Pushover.jpg)

</details>

And then our frontend deployments started failing because of too many changes.

![Website Build Error](https://i.imgur.com/T5fN0Sc.webp)

But, we managed it. The website stayed up, and a lot of people had fun. Now it's over, though. The backend is down, the frontend (with limited, read-only functionality) will stay a bit longer, but not permanently. Thanks everyone for the help.
