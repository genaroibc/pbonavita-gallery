import fs from "node:fs/promises";

const ROOT_PATH = "public/assets/img";
const collections = await fs.readdir(ROOT_PATH);

const map = {};
async function mapCollections() {
  const imagesPromises = collections.map(dir =>
    fs.readdir(`${ROOT_PATH}/${dir}`).then(images => {
      map[dir] = images.map(img => ({
        imgSrc: `${ROOT_PATH.replace("public", "")}/${dir}/${img}`,
        imgDescription: img.split(/\.\w*/)[0].replaceAll("-", " ")
      }));
    })
  );

  await Promise.allSettled(imagesPromises);
  fs.writeFile("public/maps/pictures.json", JSON.stringify(map));
}

await mapCollections();
async function mapStaticPaths() {
  fs.writeFile(
    `public/maps/staticPaths.json`,
    JSON.stringify(
      collections.map(col => ({
        params: {
          slug: col
        }
      }))
    )
  );
}

async function mapPictures() {
  fs.writeFile(
    "public/maps/collections.json",
    JSON.stringify(
      collections.map(col => ({
        imageSrc: map[col][0].imgSrc,
        collectionURL: `/arte-plastico/${col}`,
        collectionTitle: col.replaceAll("-", " ")
      }))
    )
  );
}

await Promise.all([, mapStaticPaths(), mapPictures()]);
