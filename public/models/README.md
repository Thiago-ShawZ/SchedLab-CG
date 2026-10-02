# Modelos 3D

Coloque aqui os arquivos de modelo 3D no formato GLB ou GLTF.

## Nomes esperados

Os produtos em `src/data/products.ts` referenciam estes caminhos:

- `shampoo.glb` — Shampoo Neutro
- `conditioner.glb` — Condicionador Hidratante
- `mask.glb` — Máscara de Tratamento
- `leavein.glb` — Leave-in Modelador
- `oil.glb` — Óleo Capilar
- `creme.glb` — Creme para Pentear

## Enquanto não houver modelos reais

O projeto usa placeholders 3D procedurais (garrafas, tubos, potes e conta-gotas)
gerados com geometrias do Three.js. Ao adicionar um arquivo GLB com o nome
correto, ele será carregado automaticamente.

## Recomendações

- Formato: GLB (binário, menor tamanho)
- Tamanho: abaixo de 2 MB por modelo
- Origem no centro da base do modelo
- Texturas embutidas no GLB quando possível
