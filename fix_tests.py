import re

file_path = r'tests/add_user_properties.spec.ts'
with open(file_path, 'r', encoding='utf8') as f:
    content = f.read()

# Replace waitForTimeout(200) loops with waitFor({ state: 'visible' }) inside the actual fill loop
# Wait, it's easier to just do it via replace.

# Specs
content = re.sub(
    r"const specCards = page.locator\('#sec-specs div\.grid > div'\);\s*for \(let i = 0; i < prop\.specs\.length; i\+\+\) \{",
    "const specCards = page.locator('#sec-specs div.grid > div');\n  for (let i = 0; i < prop.specs.length; i++) {\n    await specCards.nth(i).waitFor({ state: 'visible' });",
    content
)

# Financials
content = re.sub(
    r"const finCards = page.locator\('#sec-financials div\.grid > div'\);\s*for \(let i = 0; i < prop\.financials\.length; i\+\+\) \{",
    "const finCards = page.locator('#sec-financials div.grid > div');\n  for (let i = 0; i < prop.financials.length; i++) {\n    await finCards.nth(i).waitFor({ state: 'visible' });",
    content
)

# Configs
content = re.sub(
    r"const configCards = page.locator\('#sec-pricing div\.space-y-4 > div'\);\s*for \(let i = 0; i < prop\.configurations\.length; i\+\+\) \{",
    "const configCards = page.locator('#sec-pricing div.space-y-4 > div');\n  for (let i = 0; i < prop.configurations.length; i++) {\n    await configCards.nth(i).waitFor({ state: 'visible' });",
    content
)

# Amenities
content = re.sub(
    r"const amenityCards = page.locator\('#sec-amenities div\.grid > div'\);\s*for \(let i = 0; i < prop\.amenities\.length; i\+\+\) \{",
    "const amenityCards = page.locator('#sec-amenities div.grid > div');\n  for (let i = 0; i < prop.amenities.length; i++) {\n    await amenityCards.nth(i).waitFor({ state: 'visible' });",
    content
)

# Landmarks
content = re.sub(
    r"const landmarkCards = page.locator\('#sec-location div\.space-y-4 > div'\);\s*for \(let i = 0; i < prop\.landmarks\.length; i\+\+\) \{",
    "const landmarkCards = page.locator('#sec-location div.space-y-4 > div');\n  for (let i = 0; i < prop.landmarks.length; i++) {\n    await landmarkCards.nth(i).waitFor({ state: 'visible' });",
    content
)

with open(file_path, 'w', encoding='utf8') as f:
    f.write(content)
print('Done!')
