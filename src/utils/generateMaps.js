import fs from "node:fs/promises";

const ROOT_PATH = "public/assets/img";
const COLLECTIONS_DIRS = await fs.readdir(ROOT_PATH);

export async function checkImagesExtension() {
  for (const dir of COLLECTIONS_DIRS) {
    const collection = await fs.readdir(`${ROOT_PATH}/${dir}`);

    collection.forEach(imgName => {
      const imgExtension = imgName.split(".").at(-1);

      const isInvalidExtension = !imgExtension || imgExtension !== "webp";

      if (isInvalidExtension) {
        console.log(`The image '${imgName}' is not of type webp`);
      }
    });
  }
}

await checkImagesExtension();

const map = {};
async function mapCollections() {
  const imagesPromises = COLLECTIONS_DIRS.map(dir =>
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
      COLLECTIONS_DIRS.map(col => ({
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
      COLLECTIONS_DIRS.map(col => ({
        imageSrc: map[col][0].imgSrc,
        collectionURL: `/arte-plastico/${col}`,
        collectionTitle: col.replaceAll("-", " ")
      }))
    )
  );
}

await Promise.all([mapStaticPaths(), mapPictures()]);
