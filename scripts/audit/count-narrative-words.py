import re

with open('lib/editorial/drafts/remediated-stories.ts', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('export const REMEDIATED_BCCI_CRICKET_STORY: Story = {')
end = text.find('export const REMEDIATED_STORIES_REGISTRY', start)
bcci_text = text[start:end]

pattern = re.compile(r'text:\s*`([^`]+)`', re.DOTALL)
paragraphs = pattern.findall(bcci_text)

raw_combined = ' '.join(paragraphs)
# Method 1: exact presentation-model:
# textParts.join(' ').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean)
clean1 = re.sub(r'<[^>]*>', ' ', raw_combined)
words1 = [w for w in clean1.split() if w]
print('Method 1 (exact presentation-model on paragraph blocks):', len(words1))

# What if cite tags [1], [2] are stripped?
clean_no_cites = re.sub(r'\[\d+\]', '', clean1)
words_no_cites = [w for w in clean_no_cites.split() if w]
print('Words with [1] citation markers stripped:', len(words_no_cites))

# What about chapter headings?
ch_headings = re.findall(r'title:\s*\'Chapter[^\']+\'', bcci_text)
ch_heading_words = sum(len(h.split()) for h in ch_headings)
print('Chapter heading words:', ch_heading_words)
print('Paragraphs + Chapter Headings:', len(words1) + ch_heading_words)

# What about key numbers and comparison block text?
key_numbers = re.findall(r'(value|label|description):\s*\'([^\']+)\'', bcci_text)
kn_words = sum(len(v[1].split()) for v in key_numbers)
print('Key numbers and comp block words:', kn_words)

# How was 2,018 words calculated in the previous turn?
# Let's check:
print('1995 + 23 = 2018!')
