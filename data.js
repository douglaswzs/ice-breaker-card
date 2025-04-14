const data = {
  categories: [
    {
      name: {
        en: "Get to Know You",
        zh: "认识你",
        roman: "Rènshì nǐ"
      },
      questions: [
        {
          en: "What's your favorite way to spend a weekend?",
          zh: "你最喜欢如何度过周末?",
          roman: "Nǐ zuì xǐhuān rúhé dùguò zhōumò?"
        },
        {
          en: "Where did you grow up?",
          zh: "你在哪儿长大?",
          roman: "Nǐ zài nǎr zhǎng dà?"
        },
        {
          en: "What's one thing on your bucket list?",
          zh: "你的人生目标清单上有什么?",
          roman: "Nǐ de rénshēng mùbiāo qīngdān shàng yǒu shénme?"
        },
        {
          en: "Do you have any hidden talents?",
          zh: "你有什么隐藏的才华吗?",
          roman: "Nǐ yǒu shénme yǐncáng de cáihuá ma?"
        },
        {
          en: "What's a hobby you’ve always wanted to try?",
          zh: "你一直想尝试的爱好是什么?",
          roman: "Nǐ yīzhí xiǎng chángshì de àihào shì shénme?"
        }
      ]
    },
    {
      name: {
        en: "Fun & Light",
        zh: "轻松有趣",
        roman: "Qīngsōng yǒuqù"
      },
      questions: [
        {
          en: "If you could travel anywhere right now, where would you go?",
          zh: "如果你现在可以去任何地方，你会去哪里?",
          roman: "Rúguǒ nǐ xiànzài kěyǐ qù rènhé dìfāng, nǐ huì qù nǎlǐ?"
        },
        {
          en: "What's your favorite ice cream flavor?",
          zh: "你最喜欢的冰淇淋口味是什么?",
          roman: "Nǐ zuì xǐhuān de bīngqílín kǒuwèi shì shénme?"
        },
        {
          en: "Dogs or cats?",
          zh: "狗还是猫?",
          roman: "Gǒu háishì māo?"
        },
        {
          en: "If you had a superpower, what would it be?",
          zh: "如果你有超能力，你希望是什么?",
          roman: "Rúguǒ nǐ yǒu chāonénglì, nǐ xīwàng shì shénme?"
        },
        {
          en: "What’s your go-to karaoke song?",
          zh: "你最喜欢的卡拉OK歌曲是什么?",
          roman: "Nǐ zuì xǐhuān de kǎlā OK gēqǔ shì shénme?"
        }
      ]
    },
    {
      name: {
        en: "Thought-Provoking",
        zh: "发人深思",
        roman: "Fārén shēnsī"
      },
      questions: [
        {
          en: "If you could have dinner with any historical figure, who would it be?",
          zh: "如果你可以和任何历史人物共进晚餐，你会选择谁?",
          roman: "Rúguǒ nǐ kěyǐ hé rènhé lìshǐ rénwù gòng jìn wǎncān, nǐ huì xuǎnzé shéi?"
        },
        {
          en: "What does success mean to you?",
          zh: "成功对你来说意味着什么?",
          roman: "Chénggōng duì nǐ lái shuō yìwèizhe shénme?"
        },
        {
          en: "If time and money weren't an issue, what would you do every day?",
          zh: "如果时间和金钱不是问题，你每天会做什么?",
          roman: "Rúguǒ shíjiān hé jīnqián bùshì wèntí, nǐ měitiān huì zuò shénme?"
        },
        {
          en: "What’s a book or movie that changed your perspective?",
          zh: "有什么书籍或电影改变了你的观点?",
          roman: "Yǒu shénme shūjí huò diànyǐng gǎibiànle nǐ de guāndiǎn?"
        },
        {
          en: "How do you handle failure?",
          zh: "你如何应对失败?",
          roman: "Nǐ rúhé yìngduì shībài?"
        }
      ]
    },
    {
      name: {
        en: "Beliefs",
        zh: "信仰",
        roman: "Xìnyǎng"
      },
      questions: [
        {
          en: "What values are most important to you?",
          zh: "对你来说，什么价值观最为重要?",
          roman: "Duì nǐ lái shuō, shénme jiàzhíguān zuì wèi zhòngyào?"
        },
        {
          en: "Do you believe everything happens for a reason?",
          zh: "你相信一切事情都有其原因吗?",
          roman: "Nǐ xiāngxìn yīqiè shìqíng dōu yǒu qí yuányīn ma?"
        },
        {
          en: "What role does faith/spirituality play in your life?",
          zh: "信仰/灵性在你生活中的角色是什么?",
          roman: "Xìnyǎng/língxìng zài nǐ shēnghuó zhōng de juésè shì shénme?"
        },
        {
          en: "Is it more important to be kind or to be honest?",
          zh: "是善良更重要，还是诚实更重要?",
          roman: "Shì shànliáng gèng zhòngyào, háishì chéngshí gèng zhòngyào?"
        },
        {
          en: "Do you think people can change?",
          zh: "你认为人是可以改变的吗?",
          roman: "Nǐ rènwéi rén shì kěyǐ gǎibiàn de ma?"
        }
      ]
    },
    {
      name: {
        en: "Funny",
        zh: "搞笑",
        roman: "Gǎoxiào"
      },
      questions: [
        {
          en: "What’s the weirdest thing you've ever eaten?",
          zh: "你吃过最奇怪的东西是什么?",
          roman: "Nǐ chīguò zuì qíguài de dōngxī shì shénme?"
        },
        {
          en: "If animals could talk, which would be the rudest?",
          zh: "如果动物能说话，哪种动物最无礼?",
          roman: "Rúguǒ dòngwù néng shuōhuà, nǎ zhǒng dòngwù zuì wúlǐ?"
        },
        {
          en: "What’s a ridiculous fact you know?",
          zh: "你知道的最荒谬的事实是什么?",
          roman: "Nǐ zhīdào de zuì huāngmiù de shìshí shì shénme?"
        },
        {
          en: "If you were a vegetable, which one would you be and why?",
          zh: "如果你是一个蔬菜，你会是什么，为什么?",
          roman: "Rúguǒ nǐ shì yīgè shūcài, nǐ huì shì shénme, wèishéme?"
        },
        {
          en: "What's the most embarrassing thing that ever happened to you?",
          zh: "发生过的最尴尬的事情是什么?",
          roman: "Fāshēngguò de zuì gāngà de shìqíng shì shénme?"
        }
      ]
    }
  ]
};
