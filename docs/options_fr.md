# 🤖Configurations et options prises en charge

[![en-icon]](./options.md)
[![zh-hans-icon]](./options_zh-Hans.md)
[![fr-icon]](./options_fr.md)

**Symboles :** ✅ - Pris en charge, ❌ - Non pris en charge, 📌 - Prévu

## OpenAI ✅
### Configurations de l'API

| Champ | Description |
| -------- | -------- |
| Clé API | La clé API pour votre API OpenAI. |
| Modèle | ID du modèle à utiliser. |

### Conversation options
### Options de conversation

| Option | Description | Supported |
| - | - | - |
| frequency_penalty | Nombre entre -2.0 et 2.0. Les valeurs positives pénalisent les nouveaux jetons en fonction de leur fréquence existante dans le texte jusqu'à présent, diminuant la probabilité que le modèle répète la même ligne textuellement. | ✅ |
| max_tokens | Le nombre maximum de jetons qui peuvent être générés dans l'achèvement de la conversation.<br/>La longueur totale des jetons d'entrée et des jetons générés est limitée par la longueur du contexte du modèle. | ✅ |
| presence_penalty | Nombre entre -2.0 et 2.0. Les valeurs positives pénalisent les nouveaux jetons en fonction de leur présence dans le texte jusqu'à présent, augmentant la probabilité que le modèle aborde de nouveaux sujets. | ✅ |
| temperature | Quelle température d'échantillonnage utiliser, entre 0 et 2. Des valeurs plus élevées comme 0.8 rendront la sortie plus aléatoire, tandis que des valeurs plus basses comme 0.2 la rendront plus ciblée et déterministe.<br/>Nous recommandons généralement de modifier cela ou top_p, mais pas les deux. | ✅ |
| top_p | Une alternative à l'échantillonnage avec la température, appelée échantillonnage nucléaire, où le modèle considère les résultats des jetons avec une masse de probabilité top_p. Ainsi, 0.1 signifie que seuls les jetons comprenant la masse de probabilité supérieure à 10 % sont considérés.<br/>Nous recommandons généralement de modifier cela ou la température, mais pas les deux. | ✅ |
| stream | Si défini, des deltas de message partiels seront envoyés, comme dans ChatGPT. | ✅ |
| user | Un identifiant unique représentant votre utilisateur final, ce qui peut aider OpenAI à surveiller et à détecter les abus. | ✅ |
| response_format | Un objet spécifiant le format que le modèle doit produire. Compatible avec GPT-4 Turbo et tous les modèles GPT-3.5 Turbo plus récents que gpt-3.5-turbo-1106. | 📌 |
| seed | Si spécifié, notre système fera de son mieux pour échantillonner de manière déterministe, de sorte que les demandes répétées avec la même seed et les mêmes paramètres devraient renvoyer le même résultat. | 📌 |
| stop | Jusqu'à 4 séquences où l'API cessera de générer d'autres jetons. | 📌 |
| tools | Une liste d'outils que le modèle peut appeler. Actuellement, seules les fonctions sont prises en charge en tant qu'outil. Utilisez ceci pour fournir une liste de fonctions pour lesquelles le modèle peut générer des entrées JSON. | ❌ |
| tool_choice | Contrôle quelle fonction (le cas échéant) est appelée par le modèle. none signifie que le modèle n'appellera pas de fonction et générera plutôt un message. auto signifie que le modèle peut choisir entre générer un message ou appeler une fonction. Spécifier une fonction particulière via {"type": "function", "function": {"name": "my_function"}} force le modèle à appeler cette fonction.<br/>none est la valeur par défaut lorsqu'aucune fonction n'est présente. auto est la valeur par défaut si des fonctions sont présentes. | ❌ |
| logit_bias | Modifie la probabilité que des jetons spécifiés apparaissent dans l'achèvement. <br/> Accepte un objet JSON qui mappe les jetons (spécifiés par leur ID de jeton dans le tokenizer) à une valeur de biais associée de -100 à 100. Mathématiquement, le biais est ajouté aux logits générés par le modèle avant l'échantillonnage. L'effet exact variera selon le modèle, mais les valeurs entre -1 et 1 devraient diminuer ou augmenter la probabilité de sélection ; les valeurs comme -100 ou 100 devraient entraîner une interdiction ou une sélection exclusive du jeton pertinent. | ❌ |
| logprobs | Indique s'il faut renvoyer ou non les probabilités logarithmiques des jetons de sortie. Si la valeur est true, renvoie les probabilités logarithmiques de chaque jeton de sortie renvoyé dans le contenu du message. Cette option n'est actuellement pas disponible sur le modèle gpt-4-vision-preview. | ❌ |
| top_logprobs | Un entier entre 0 et 5 spécifiant le nombre de jetons les plus probables à renvoyer à chaque position de jeton, chacun avec une probabilité logarithmique associée. logprobs doit être défini sur true si ce paramètre est utilisé. | ❌ |
| n | Combien de choix d'achèvement de conversation générer pour chaque message d'entrée. Notez que vous serez facturé en fonction du nombre de jetons générés dans tous les choix. Gardez n à 1 pour minimiser les coûts. | ❌ |


### References

- [OpenAI Documentation](https://platform.openai.com/docs/guides/text-generation/chat-completions-api)

## Microsoft Azure ✅
## Microsoft Azure ✅

### Configurations de l'API

| Champ | Description |
| -------- | -------- |
| Clé API | La clé API pour votre API Azure OpenAI. |
| Point de terminaison | Le point de terminaison pour votre API Azure OpenAI. |
| Version de l'API | La version de l'API à utiliser pour cette opération. Ceci suit le format AAAA-MM-JJ ou AAAA-MM-JJ-preview. |
| ID de déploiement | Le nom du déploiement de votre modèle. |

### Options de conversation
| Option | Description | Pris en charge |
| - | - | - |
| max_tokens | Le nombre maximum de jetons à générer dans l'achèvement. Le nombre de jetons de votre prompt plus max_tokens ne peut pas dépasser la longueur de contexte du modèle. | ✅ |
| temperature | Quelle température d'échantillonnage utiliser, entre 0 et 2. Des valeurs plus élevées signifient que le modèle prend plus de risques. Essayez 0.9 pour des applications plus créatives, et 0 (échantillonnage argmax) pour celles avec une réponse bien définie. Nous recommandons généralement de modifier ceci ou top_p mais pas les deux. | ✅ |
| top_p | Une alternative à l'échantillonnage avec température, appelée échantillonnage nucleus, où le modèle considère les résultats des jetons avec une masse de probabilité top_p. Ainsi, 0.1 signifie que seuls les jetons comprenant les 10% supérieurs de la masse de probabilité sont considérés. Nous recommandons généralement de modifier ceci ou la température mais pas les deux. | ✅ |
| presence_penalty | Nombre entre -2.0 et 2.0. Les valeurs positives pénalisent les nouveaux jetons en fonction de leur présence dans le texte jusqu'à présent, augmentant la probabilité que le modèle aborde de nouveaux sujets. | ✅ |
| frequency_penalty | Nombre entre -2.0 et 2.0. Les valeurs positives pénalisent les nouveaux jetons en fonction de leur fréquence existante dans le texte jusqu'à présent, diminuant la probabilité que le modèle répète la même ligne textuellement. | ✅ |
| stream | Si défini, des deltas de message partiels seront envoyés, comme dans ChatGPT. | ✅ |
| user | Un identifiant unique représentant votre utilisateur final, ce qui peut aider OpenAI à surveiller et à détecter les abus. | ✅ |
| suffix | Le suffixe qui vient après un achèvement du texte inséré. | 📌 |
| echo | Renvoie le prompt en plus de l'achèvement. Ce paramètre ne peut pas être utilisé avec gpt-35-turbo. | 📌 |
| stop | Jusqu'à quatre séquences où l'API arrêtera de générer d'autres jetons. Le texte renvoyé ne contiendra pas la séquence d'arrêt. Pour GPT-4 Turbo avec Vision, jusqu'à deux séquences sont prises en charge. | 📌 |
| logit_bias | Modifie la probabilité que des jetons spécifiés apparaissent dans l'achèvement. Accepte un objet json qui mappe les jetons (spécifiés par leur ID de jeton dans le tokenizer GPT) à une valeur de biais associée de -100 à 100. Mathématiquement, le biais est ajouté aux logits générés par le modèle avant l'échantillonnage. L'effet exact varie selon le modèle, mais les valeurs entre -1 et 1 devraient diminuer ou augmenter la probabilité de sélection ; les valeurs comme -100 ou 100 devraient entraîner une interdiction ou une sélection exclusive du jeton pertinent. | ❌ |
| n | Combien de choix d'achèvement de conversation générer pour chaque message d'entrée. Notez que vous serez facturé en fonction du nombre de jetons générés dans tous les choix. Gardez n à 1 pour minimiser les coûts. | ❌ |
| logprobs | Inclut les probabilités logarithmiques sur les jetons les plus probables de logprobs, ainsi que les jetons choisis. Ce paramètre ne peut pas être utilisé avec gpt-35-turbo. | ❌ |
| best_of | Génère best_of achèvements côté serveur et renvoie le "meilleur" (celui avec la plus faible probabilité logarithmique par jeton). Les résultats ne peuvent pas être diffusés en continu. Lorsqu'il est utilisé avec n, best_of contrôle le nombre d'achèvements candidats et n spécifie combien en renvoyer – best_of doit être supérieur à n. Ce paramètre ne peut pas être utilisé avec gpt-35-turbo. | ❌ |

### Références

- [Documentation Azure](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference#chat-completions)

## Anthropic Claude ✅

### Configurations de l'API

| Champ | Description |
| -------- | -------- |
| clé-api | La clé API pour votre API Anthropic. |
| version-anthropic | La version d'Anthropic à utiliser. |
| modèle | Le modèle Anthropic à utiliser. |

### Options de conversation

| Option | Description | Pris en charge |
| - | - | - |
| max_tokens | Le nombre maximum de jetons à générer avant l'arrêt. | ✅ |
| temperature | Quantité d'aléatoire injectée dans la réponse.<br/>Par défaut à 1.0. Varie de 0.0 à 1.0. Utilisez une température proche de 0.0 pour l'analytique / choix multiple, et proche de 1.0 pour les tâches créatives et génératives.<br/>Nous recommandons généralement de modifier ceci ou top_p mais pas les deux. | ✅ |
| top_p | Utilise l'échantillonnage du noyau.<br/>Recommandé uniquement pour les cas d'utilisation avancés. Vous n'avez généralement besoin d'utiliser que _temperature_. | ✅ |
| stream | Si la réponse doit être diffusée de manière incrémentielle en utilisant les événements envoyés par le serveur. | ✅ |
| user | Un objet décrivant les métadonnées de la requête. <br/>_metadata.user_id_: Un identifiant externe pour l'utilisateur associé à la requête. | ✅ |
| stop_sequences | Séquences de texte personnalisées qui feront arrêter la génération du modèle. | 📌 |
| top_k | Échantillonne uniquement parmi les K meilleures options pour chaque jeton suivant.<br/>Recommandé uniquement pour les cas d'utilisation avancés. Vous n'avez généralement besoin d'utiliser que _temperature_. | 📌 |
| tools | Définitions des outils que le modèle peut utiliser. | ❌ |
| tool_choice | Comment le modèle doit utiliser les outils fournis. | ❌ |

## Ollama ✅
### Configurations de l'API

| Champ | Description |
| - | - |
| Point de terminaison | Le point de terminaison pour votre API Azure OpenAI. |
| Modèle | Le modèle à utiliser. |

### Options de conversation

| Option | Description | Pris en charge |
| - | - | - |
| num_ctx | Nombre de jetons d'entrée. Définit la taille de la fenêtre de contexte utilisée pour générer le jeton suivant. (Par défaut : 2048) | ✅ |
| num-predict | Nombre de jetons de sortie. Nombre maximum de jetons à prédire lors de la génération de texte. (Par défaut : 128, -1 = génération infinie, -2 = remplir le contexte) | ✅ |
| temperature | La température du modèle. Augmenter la température rendra les réponses du modèle plus créatives. (Par défaut : 0.8) | ✅ |
| top_p | Fonctionne avec top-k. Une valeur plus élevée (par ex., 0.95) conduira à un texte plus diversifié, tandis qu'une valeur plus basse (par ex., 0.5) générera un texte plus ciblé et conservateur. (Par défaut : 0.9) | ✅ |
| mirostat | Active l'échantillonnage Mirostat pour contrôler la perplexité. (par défaut : 0, 0 = désactivé, 1 = Mirostat, 2 = Mirostat 2.0) | 📌 |
| mirostat_eta | Influence la rapidité de réaction de l'algorithme au feedback du texte généré. Un taux d'apprentissage plus bas entraînera des ajustements plus lents, tandis qu'un taux plus élevé rendra l'algorithme plus réactif. (Par défaut : 0.1) | 📌 |
| mirostat_tau | Contrôle l'équilibre entre cohérence et diversité de la sortie. Une valeur plus basse donnera un texte plus ciblé et cohérent. (Par défaut : 5.0) | 📌 |
| repeat_last_n | Définit jusqu'où le modèle doit regarder en arrière pour éviter la répétition. (Par défaut : 64, 0 = désactivé, -1 = num_ctx) | 📌 |
| repeat_penalty | Définit l'intensité de la pénalité pour les répétitions. Une valeur plus élevée (par ex., 1.5) pénalisera plus fortement les répétitions, tandis qu'une valeur plus basse (par ex., 0.9) sera plus tolérante. (Par défaut : 1.1) | 📌 |
| seed | Définit la graine aléatoire à utiliser pour la génération. La définition d'un nombre spécifique fera générer le même texte pour le même prompt. (Par défaut : 0) | 📌 |
| stop | Définit les séquences d'arrêt à utiliser. Lorsque ce motif est rencontré, le LLM arrêtera de générer du texte et retournera. Plusieurs motifs d'arrêt peuvent être définis en spécifiant plusieurs paramètres stop séparés dans un modelfile. | 📌 |
| tfs_z | L'échantillonnage sans queue est utilisé pour réduire l'impact des jetons moins probables de la sortie. Une valeur plus élevée (par ex., 2.0) réduira davantage l'impact, tandis qu'une valeur de 1.0 désactive ce paramètre. (par défaut : 1) | 📌 |
| top_k | Réduit la probabilité de générer du non-sens. Une valeur plus élevée (par ex., 100) donnera des réponses plus diverses, tandis qu'une valeur plus basse (par ex., 10) sera plus conservatrice. (Par défaut : 40) | 📌 |
| min_p | Alternative au top_p, vise à assurer un équilibre entre qualité et variété. Le paramètre p représente la probabilité minimale pour qu'un jeton soit considéré, par rapport à la probabilité du jeton le plus probable. Par exemple, avec p=0.05 et le jeton le plus probable ayant une probabilité de 0.9, les logits avec une valeur inférieure à 0.045 sont filtrés. (Par défaut : 0.0) | 📌 |

### Références
- [Ollama Modelfile](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#valid-parameters-and-values)

## Google Gemini

📌 **Support Planifié**

[en-icon]: https://img.shields.io/badge/English-teal?style=flat-square
[zh-hans-icon]: https://img.shields.io/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-teal?style=flat-square
[fr-icon]: https://img.shields.io/badge/Français-teal?style=flat-square