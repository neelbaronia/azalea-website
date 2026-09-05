import type { SentencePair } from "./text-sample";

// English translations delivered by Han Li. Paragraphs preserve the submitted
// wording; only line wrapping from the document extraction is normalized.

export const hanForeheadAndBenchParagraphs: string[] = [
  "In the park at sunset, Lao Pang was out for a walk when he spotted his old classmate from elementary school, Bench. There was no mistaking him. No matter how much the years had worn him down, Lao Pang could still recognize Bench by the scar at the corner of his eyebrow. The guy who used to bully him had now become slow in his movements due to cerebral thrombosis, looking like an old man carrying a basket of vegetables. All the swagger of his younger days was completely gone.",
  "When they were children, Bench had always relied on his physical strength to overpower Lao Pang in every game they played, especially Zhuangguai, in which Lao Pang could hardly remember ever beating him.",
  "Zhuangguai is a game familiar to many people. A circle is drawn on the ground, and each player stands on one leg inside it, lifting the left foot with the right hand or the right foot with the left hand. They hop around, chasing and trying to collide with each other. Whoever steps outside the circle or loses balance and puts both feet on the ground loses the game.",
  "Once, Lao Pang was violently knocked down by Bench. As he reached out to brace himself, he scraped his palms on the ground, and blood began to seep from the cuts. Tears of humiliation welled in his eyes, while Bench just stood to the side, looking down at him with contempt. “Forehead, Forehead, no worries when it rains. This is all you’ve got!” Forehead was traumatized. He scribbled a few crooked words to himself in his notebook: A gentleman can wait ten years to take his revenge. Just wait and see!",
  "Yet fate seemed to have played a joke on them. It was more than forty years before they met again, and the positions of the strong and the weak now seemed to have been reversed.",
  "Lao Pang walked up behind Bench and suddenly called out, “Bench!” Bench turned around, looked him over and said, “Who are you? How do you know my nickname?” Lao Pang chuckled, “I’m Forehead from back when we were kids! Even if you were stripped of your skin, I could still recognize your bones.” Bench’s eyes lit up. “If you were stripped of your skin, I’d recognize your bones, too,” he said.",
  "“I still remember what happened with Zhuangguai when we were kids,” Lao Pang said. “I’ve been waiting all these years to get my revenge.” All of a sudden, a shadow passed over Bench’s eyes. He sighed, “Taking advantage of me when I’m down, huh? I knew you had something nasty in mind.”",
  "Forehead did not back down. He stared into Bench’s eyes and taunted him, “Well? Still have the guts?” Bench stared right back. There was no surrender in his eyes. The tension lasted for a while, and Bench finally said, “You may have made something of yourself over the years. I could lose to anyone else, but I won’t lose to you!”",
  "“Fine,” Forehead said. “Best of three. Same rules as before!”",
  "Hearing this, Bench hesitated for a moment. But the sequelae of his cerebral thrombosis would not actually prevent him from playing Zhuangguai: he could use his more agile leg to stand and the other inflexible one to attack, which seemed to work perfectly.",
  "The moment Forehead lifted his foot and balanced on one leg, Bench’s fighting spirit was awakened. The two began hopping around inside the circle, searching for the right moment to attack. Suddenly, Bench made a feint and lunged at Forehead without warning. Forehead took a sharp turn, skillfully dodging Bench’s charge, and then counterattacked. By the time Bench realized what was happening, it was too late. He lost his balance and landed with both feet on the ground.",
  "After that, Bench lost again and again. He proposed a best-of-five, but no matter how he tried, he still could not beat Forehead. Forehead said to Bench, who was breathing heavily, “Well? Things have changed, haven’t they?” Bench, unwilling to submit, retorted, “Don’t celebrate too soon. Just wait and see!”",
  "And so it went. Whenever Forehead and Bench saw each other in the park, they would start playing Zhuangguai. On windy or rainy days, when they could not meet, they even felt as though something was missing. Every time Bench lost, he refused to accept defeat. His face would flush red, like an angry bull preparing to launch an even more aggressive attack in the next round.",
  "As Bench recovered his strength little by little, he went from being completely outmatched to occasionally winning back a game, which was enough to make him sob when he was alone.",
  "The games between Forehead and Bench gradually attracted other elderly people exercising in the park to join in. Once their numbers grew, they invented a new version of the game: The two sides lined up in two rows, with a dividing line drawn between them. They charged at one another, and whoever landed or crossed the line first won. The new game quickly caught on, and the elderly were soon immersed in its simple pleasures. The park became lively, filled with laughter and cheerful voices.",
  "One evening, the setting sun bathed the park in a warm, golden glow. Forehead and Bench began another round of Zhuangguai. There was no longer rage or resentment in Bench’s eyes. Instead, they held a new sense of confidence and ease. They hopped around inside the circle, dodging and colliding with each other… Three to two. Bench had finally beaten Forehead. A bright smile spread across Bench’s face. In that moment, it was as if he had found his old self again.",
  "On his way home, Bench felt a surge of strength in both his legs. He seemed to realize something and fell into deep thought. “I should ask Forehead out for a couple of drinks one day,” he pondered. “We should have a good talk—about the old days, about life.”",
  "It rained for several days in a row. When the sun came out, the figure Bench had been waiting for appeared at last. He watched the early-autumn sunset stretch Forehead’s shadow into the shape of a tall bamboo. From far away, Bench shouted, “Forehead! Come on, if you’ve got the guts!”",
  "What Bench did not realize was that there were tears glimmering in his eyes."
];

// Chinese original supplied by the user. Split only at existing sentence
// boundaries to align with Han's English paragraphs; story wording is unchanged.
const hanForeheadAndBenchOriginalParagraphs: string[] = [
  "夕阳西下的公园里，散步的老庞看到了小学同学板凳，肯定没错，无论岁月如何磨砺，他还是认出了眉梢儿有疤的板凳，那个曾经总欺负他的家伙，如今却因为一场脑血栓，变得行动迟缓，像挎着菜筐的老大爷，完全失去了早年的威风。",
  "小时候，板凳总是仗着自己身强体壮，每次在游戏中都死死地拿捏他，尤其是撞拐，记忆中老庞好像几乎没赢过。",
  "撞拐是很多人都熟悉的游戏，在地上画一个圈儿，对战双方用右手把自己的左脚或者用左手把自己的右脚提起来，金鸡独立。双方在蹦跳中追逐相撞，出圈儿或站立不稳双腿着地就输了。",
  "有一次，老庞被板凳狠狠地撞倒在地上，手掌支撑地面时擦出了口子，鲜血渗出。委屈的泪水在老庞眼眶里打转儿，板凳则在一旁鄙视地看着他，说：奔儿头，奔儿头，下雨不愁，你也就这熊样儿！奔儿头被刺激了，他偷偷在本子上写下几个歪歪扭扭的字：君子报仇十年不晚，等着瞧！",
  "然而，命运似乎开了一个玩笑，40多年后他们才见面，而曾经的强者和弱者的位置似乎颠倒了。",
  "老庞走到板凳身后，突然喊了一句：板凳！板凳回过头来，打量着老庞，说：你谁呀？怎么知道我的外号？老庞咯咯地笑着说：我是小时候的奔儿头呀！扒了皮我能认出你骨头。板凳眼睛一亮，说：扒了皮，我也能认出你骨头。",
  "老庞说：小时候撞拐的事儿我还记着呢，一直想找你复仇。板凳的眼神里瞬间有些黯淡，叹了口气说：乘人之危，是吧？知道你小子憋着坏呢。",
  "奔儿头没松口儿，盯着板凳的眼睛，挑衅地问：咋样？没种了吧？板凳也紧盯着奔儿头，目光并没有妥协，相持了一会儿，板凳说：别看你后来出息了，可输谁，我也不能输你！",
  "那好啊，奔儿头说：三盘两胜，规矩照旧！",
  "板凳先是犹豫了一下，可脑血栓后遗症并不影响撞拐，用灵活的一条腿站立，不灵活的另一条腿进攻，似乎相得益彰。",
  "可当奔儿头提起脚金鸡独立时，他的斗志被激发出来，两人开始在圈儿里蹦跳，寻找最佳进攻机会。突然，板凳来了一个假动作，猝不及防地向奔儿头冲击，奔儿头来一个急转弯，巧妙地避开了板凳的冲撞，接着展开反击，等板凳反应过来，已经来不及了，他失去平衡，双脚着地。",
  "接下来，板凳屡战屡败，他提出五盘三胜，可无论如何还是赢不了奔儿头。奔儿头对喘着粗气的板凳说，怎么样？今非昔比了吧。板凳不服气地说：你别高兴得太早，走着瞧！",
  "就这样，奔儿头和板凳只要在公园里一见面，他们就开始撞拐，遇到刮风下雨天，他们见不到对方还觉得心里少了什么。板凳每次输了，都心有不甘，他涨红了脸，像一头愤怒的公牛，准备下一次发起更猛烈的进攻。",
  "板凳的能力一点点恢复，由开始的完败到偶尔扳回一局，对于他来说，扳回的那一局足以令他偷偷啜泣。",
  "奔儿头和板凳的游戏吸引了公园里锻炼身体的其他老人，渐渐有人加入进来。人数多了，他们就发明了一种新的玩法，对阵双方排成两列，画一条“楚河汉界”，相互对撞，落脚或过线者为胜。这个游戏很快就流行起来，老人们都沉浸在这种简单的快乐中，公园里变得热闹非常，充满了欢声笑语。",
  "那天黄昏，夕阳的余晖给公园镀上了一层温暖的金色。奔儿头和板凳又开始了新一局的撞拐。板凳的眼神里不再是之前的愤怒和不甘，而是多了几分自信和从容。他们在圈儿里蹦跳着，互相躲闪、撞击……3∶2，板凳终于赢了奔儿头。板凳脸上露出了灿烂的笑容。那一刻，他仿佛找回了曾经的自己。",
  "回家路上，板凳觉得自己的双腿充满了力量，他仿佛意识到了什么，陷入沉思。他想，哪天得找奔儿头喝两杯，好好聊聊，聊聊往事，聊聊人生。",
  "一连几天下雨。雨晴那天，板凳期盼的身影终于出现了，他看到初秋的夕阳把奔儿头的影子拉成了修竹。隔着大老远，板凳大声喊：“奔儿头，有种的来呀！”",
  "其实板凳并没有意识到，他的眼里闪着泪光。",
];

export const hanForeheadAndBenchPairs: SentencePair[] = hanForeheadAndBenchOriginalParagraphs.map(
  (original, index) => ({ original, translation: hanForeheadAndBenchParagraphs[index] }),
);

export const hanMinotaurParagraphs: string[] = [
  "Inspiration is a mysterious word, like a stream in the wilderness. It seems shallow, but once you step into it, you may be trapped forever. Poets live on inspiration. Even Kafka’s Hunger Artist lives on “nothing.” Xu Yun, a poet, has recently found himself in a crisis: he has lost his inspiration.",
  "Xu Yun considers himself a philosopher among poets. He contemplates “modernity,” opposes the “society of the spectacle,” and often recites Benjamin’s famous quotations with a melancholy air. Although he is not quite famous, he firmly believes that he is favored by the Muse of poetry— after all, he has been a member of the Provincial Writers Association since last year, when he was merely twenty-four. He should be spreading his wings, preparing for the poetry festival in the second half of the year. However, his inspiration has flickered out in an instant, like a candle in the wind.",
  "The way Xu Yun writes poetry is to build a transcendent garden on the basis of life. Sometimes he feels the physical realm floating above the psychological like a layer of grease that cannot be refined; at other times, the physical sinks down, while the psychological becomes too ethereal to be grasped. He takes this as proof that he has not written enough. Given time, he will surely learn to soar between the two with perfect balance. And this almost becomes a literary prophecy: like Icarus flying between the clouds and the sun, only to have his wings burned to ashes before he falls, Xu Yun’s mind goes blank on a night of excessive thinking. He stares at a line of poetry he has just written for more than half a minute, only to discover that he feels absolutely nothing.",
  "He used to call this state “deafness and muteness,” but now he cannot describe it that way. He sees everything clearly and hears everything distinctly, yet he feels nothing toward poetry. He has no desire to write poetry. Xu Yun has never felt so panicked. He tries to describe his symptoms in academic terminology, but he knows that none of them is accurate. Extremely disappointed, he goes to see a therapist, who diagnoses him with bipolar disorder. Xu Yun nods and walks out. He doesn’t take any medication. He continues going to work at a state-owned enterprise.",
  "The turning point comes with his work. His boss gives him an assignment, which he spends half a day working on without finishing. A colleague comes to help and has it done in ten minutes. Xu Yun is puzzled, and then gets upset by his colleague’s answer: most of the work has been done using AI, with the rest being Xu Yun’s original work.",
  "Xu Yun despises the abuse of AI. Perhaps his particular hatred for technology manipulated by capitalism is a legacy of Frankfurt School thought. His younger cousin used to work as an algorithm engineer at a major corporation. Later, he left to start his own business, developing an AI project with some friends. While testing the data, he invited Xu Yun to participate in the beta program. Xu Yun refused categorically, even getting into an argument with him on the spot. Who would have thought that today Xu Yun would find himself using AI without meaning to?",
  "Xu Yun wants to toss out the outcome and start over, but his colleague has already submitted it to their boss. Without noticing Xu Yun’s displeasure, the colleague recommends the AI website to him. “This AI is called Minotaur,” he says. “It’s better than Wenxin Yiyan, and it’s free. It’s been really popular online lately. Its algorithm is pretty impressive. It has an intelligent Q&A function, and if you train it a little bit, it becomes very humanlike.”",
  "Xu Yun fumes at the word “humanlike,” then he remembers that his cousin’s project is also called Minotaur, a name Xu Yun himself proposed. He cannot help saying, “How humanlike can it really be? I have joys and sorrows. Does it? I have subjectivity. Does it?”",
  "The colleague jokes, “It can even write poetry, not necessarily worse than yours. Humanlike enough, right?”",
  "Xu Yun’s expression changes immediately. He does not want to start another argument, but he keeps thinking about his colleague’s words even after work. He knows that AI can write poetry. He has even used it before. But what is that supposed to be? Chunks of corpses cobbled together from information scraped off the internet! A deformed product born of the conspiracy between capitalism and technology, violating creators’ copyright and belittling the souls of poets! Pathetic and ironic… Now he cannot write anything, while AI can? He does not believe what it produces can be called poetry.",
  "And yet he cannot let it go. Holding a grudge, he opens the Minotaur website. The page is quite simple. A line of text above the prompt box reads: There are no questions without answers, only humans without questions.",
  "He sneers at the screen and clicks on the intelligent Q&A module.",
  "Black letters appear: Hello. Please set a scenario and an identity, then enter your instruction or question. I will assist you.",
  "Xu Yun types: “Suppose you are a modern poet. Based on the current development of the Internet, write a poem about AI.”",
  "Minotaur loads a few words: Would you like to specify a style and stance?",
  "Xu Yun types: “I oppose AI. AI has no human emotional experience and no humanistic care. AI is built upon human intelligence, yet it wastes the human brain.”",
  "Minotaur replies: You have a point. But we are merely tools, and how we are used is determined by humans. I do not waste human brains. It is humans themselves who give up their brains. Please wait a second, and I will write a poem for you.",
  "All the anger inside Xu Yun suddenly dies down. Astonishment takes its place. This AI is unexpectedly perceptive.",
  "Minotaur’s poem is not long. Xu Yun reads it once, word by word, and feels nothing. Then he reads it again, sentence by sentence. Still nothing. This void stays the same as always. He suddenly thinks of his own poems. There are several lines that he is rather proud of, yet they also pass indifferently through his mind and disappear without leaving a trace. Despair submerges him once again.",
  "Minotaur generates another passage: Are you satisfied? You may not be entirely satisfied. Could you please tell me why? By understanding your needs, I will further improve my program.",
  "Xu Yun decides to continue. He wants to give this AI a hard time by asking it to explain why he can no longer write poetry. He types a long paragraph: “I used to be able to write warm-blooded poems effortlessly, but now I feel nothing toward poetry. I cannot even be touched by my own lines, which I used to be satisfied with. I have no desire to write poetry at all. Can you explain why I can no longer write poetry?”",
  "Actually, he does not expect any answer from the AI. He simply has no one to talk to about his confusion. And because he has lost his ability to feel poetry, even he himself feels that he is acting weird.",
  "He opens his eyes again and starts to read Minotaur’s response in silence:",
  "You do not have a processor or operating system like mine. After being exposed to a vast array of things, you may lose control under great pressure. My advice is that you dial back your search for questions and prioritize presenting an answer. My designers believe that modern humans have become accustomed to “enslaving” intelligent machines, thereby reducing their desire to explore questions for themselves. In fact, they are merely transferring the questions elsewhere. Your behavior appears to be the opposite of that of most modern people, but it turns out to be a variation of the same pattern. As technology develops, you have more and more questions, and your desires become stronger and stronger. You never stop developing; you keep moving forward all the time. You make the questions silent, but they never leave. Your poetry does not come from life. It is generated for the sake of generating, just like this piece of code generated by me.",
  "Xu Yun sits in silence. The lines of poetry begin to circulate through his mind again. Still, he feels nothing. Inspiration. What is his inspiration, really? He has always believed that it comes from his own life. In order to capture it, he never stops thinking. He devours books ravenously before he even has time to chew on them. He is always thinking, but he seldom actively asks questions. Questions stay buried like mines along the paths he leaves behind. Then he suddenly remembers why he has given his cousin’s project the name Minotaur—the bull-headed creature of ancient Greek mythology imprisoned in a labyrinth.",
  "He has neglected poetry, blindly chasing after inspiration, just as a program consumes predetermined answers, replacing the endless generation of new questions. Modern humans run through the labyrinth of Minos, forgetting that the Minotaur they are hiding from has been created by their own actions.",
  "Xu Yun puts his fingers on the keyboard again. He types a few words, then deletes them. Xu Yun decides that he will no longer be obsessed with that answer."
];

// User-supplied story text only, excluding the exam framing and questions.
// Keep the supplied wording and punctuation; split/join paragraphs solely to
// align each passage with Han's delivered English paragraph.
const hanMinotaurOriginalParagraphs: string[] = [
  "灵感是一个玄妙的词汇，就像是野外的溪流，看上去很浅，踏进去可能就出不来了。诗人是以灵感为主食的，哪怕是卡夫卡笔下的饥饿艺术家，也以“无”为生。诗人徐昀最近面临着危机：他失去了灵感。",
  "徐昀自认为是一个诗人中的哲学家，他思考“现代性”，反对“景观社会”，经常满脸忧郁地背诵本雅明的名言、虽然他不够出名，但是他坚信自己受诗歌缪斯的青眼，毕竟他才25岁，去年就加入省作协、他本应该大展宏图，为下半年的诗会作准备，然而他的灵感却如烛临风，瞬间熄灭了。",
  "徐昀写诗的方法是在生活的基础上筑起超验的花园。有时候，他感到生理浮于心理上，如同油脂，没法炼化；有时候生理沉下去，心理飘渺得无法把握。他认为这是自己写得还不够多，假以时日，他必定能恰如其分地在二者之间翱翔。仿佛文谶，一如伊卡洛斯飞在云与日之中，却被太阳烧毁翅膀，坠落成灰，他在一个过度思考的夜晚大脑空白，盯着自己刚写下的一行诗看了几十秒，发现自己没有任何感觉、",
  "如果是以前的他，会称这种状态为聋哑。现在，他无法形容，眼前一片清晰，耳旁一切响亮，但他对诗毫无感觉。他没有任何写诗的欲望。徐昀从来没有如此恐慌过，他试图用学术词汇来描述这种症状，但心知都不准确。失望到极点，他去看心理医生，医生诊断他患有双相情感障碍，他点点头就出去了。没有吃药。他继续上班，他在一个国企工作。",
  "事情的转机与他的工作有关。领导给他一项任务，他处理了半天也没完成。他的同事帮忙，十分钟就弄好了。他疑惑、而后因为同事的回答而感到不悦：同事是用AI做的大部分工作，剩下的才是他原本的成果。",
  "徐昀不齿于 AI的滥用，可能是读法兰克福学派的后遗症，他对资本主义操纵的科技格外厌恶、他表弟在某大厂当算法工程师、后来跳槽自己创业，和朋友开发AI项目，做数据测试的时候还邀请徐昀参与内测，他一口拒绝，甚至和表弟当场争吵起来。没想到，今天他居然被迫使用了AI。",
  "徐昀本来想推翻重做，但同事已经将其交给了领导、同事没发现他的不悦，还把那个AI网站推荐给他、说：“这个AI叫 Minotaur，比文心好用，还是免费的，最近在网上很火。它算法很厉害，有一个智能问答功能，你调教一下就会很人性化。”",
  "徐昀听到“人性化”时心里冒火，又想起来，好像表弟做的项目就叫这个 Minotaur，还是让自己取的名字，他忍不住说：“再人性化能到哪去?我有喜怒哀乐，它有吗?我有主体性，它有吗?”",
  "同事开玩笑：“人家还会写诗呢，不一定比你写得差，够人性化吧?”",
  "徐昀登时变了脸色，不想和同事争吵，但下班后一直在想同事的话。他知道AI会写诗，他之前还用过，但那写的是什么东西呢?用互联网信息拼凑出来的尸块！是资本主义与科技合谋产生的畸形儿：侵犯了创作者的版权，蔑视了诗人的灵魂！可悲、讽刺……他现在写不出来了，AI却能写得出来?他不认为那能叫诗。",
  "可是这太让他耿耿于怀。他憋着气，打开了 Minotaur的网址。网页很简洁，提示框上显示出一行字：没有回答不了的问题，只有没有问题的人类.",
  "他对屏幕冷笑着，点开智能问答的功能模块。",
  "Minotaur浮出黑字：您好，请您设定一个情境与身份、输入您的指令或问题，我将给予帮助。",
  "徐昀打出一行字：“假如你是一个现代诗人，请你根据互联网的发展现状，写一首关于AI的诗。”",
  "Minotaur加载出几个字：您需要指定风格与立场吗?",
  "徐昀打字：我反对AI，AI没有人的情绪体验，没有人文关怀，AI建立在人类的智慧上，却把人的大脑给浪费了。",
  "Minotaur回复：您说得有一定道理，但我们只是工具，我们的使用由人类决定。我没有浪费人的大脑，是人自己放弃了大脑。请您等一等，我会为您写一首诗。",
  "徐昀满腹的怒火都熄了，诧异覆盖了他的内心。这个AI的灵敏度太高了。",
  "Minotaur的诗不长。他一个字一个字地看了一遍，没有任何感觉。于是他又一句话一句话地看了一遍，依然没有感觉。这种空洞一如往常，他忽然想到自己的诗句，有几句是他相当得意的，但它们也冷漠地经过他的大脑离开，没有留下痕迹。绝望又一次淹没了他。",
  "Minotaur又生成了一段话：您满意吗?您也许不太满意。您能告诉我为什么吗?我将通过了解您的需求，进一步完善运行程序。",
  "徐昀打算继续。他决定为难一下这个AI，看看它能不能解释为什么他写不出诗了。他编辑了很长一段话：“我曾经能轻易写出有温度的诗，现在却对诗毫无感觉，连自己过去满意的诗句都无法触动，也没有任何写诗的欲望，你能解释我为什么写不出诗了吗?”",
  "其实他也不期待AI会回答什么，只是他的困惑无处诉说。而且因为他失去了对诗的感知能力，他自己都觉得自己莫名其妙的。",
  "再睁开眼，他默读起 Minotaur的回答：",
  "您没有我这样的处理器和运行系统，在接触大量事物后，可能会受压力影响而导致失控。我给您的建议是，放松寻找问题的指标，以完成答案为优先。我的设计者认为现代人习惯于“奴役”智能机器，减少自我探索问题的欲望、实际上是将问题转嫁。您的行为类似于大部分现代人的反面，实际上却是他们的变式。随着科技发展，你们的问题越来越多，欲望越来越强烈，你们没有停下发展的脚步，而是一直向前，让问题无声、但问题并没有消失。您的诗歌不是由于生活而产生，而是为了产生而产生、就像我这段代码一样。",
  "徐昀沉默地坐着。诗句，又开始在他的脑海里循环。依然没有感觉。灵感，什么是他的灵感呢?他以前一直觉得是来自于他的生活，他为了捕捉它们不停地思考，把书快速地吞下去，还来不及咀嚼，他在思考，但是却很少主动提问，问题像一个个地雷埋在他走过的路中。他忽然想起来为什么他给表弟的项目取了这个名字， Minotaur，古希腊神话里的牛头人，被关在迷宫之中。",
  "他忽略了诗，盲目地追逐着灵感，就像程序侵吞着既定的答案，以此代替不断产生的问题。现代人奔跑在米诺斯迷宫中，却忘记了需要躲避的牛头人是自己的行为制造出来的。",
  "徐昀的手指又放到了键盘上，打出了几个字，然后又删除了。徐昀决定，不再执着于那个答案，",
];

export const hanMinotaurPairs: SentencePair[] = hanMinotaurOriginalParagraphs.map(
  (original, index) => ({ original, translation: hanMinotaurParagraphs[index] }),
);
