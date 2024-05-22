"use server";
const blockade_key = process.env.BLOCKADE;

export async function getPanorama(prompt: string, style_id: number = 119) {
  console.log("generating panorama");
  console.log(blockade_key);
  const response = await fetch(
    `https://backend.blockadelabs.com/api/v1/skybox`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": `${blockade_key}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        skybox_style_id: style_id,
      }),
    }
  );

  
  const responseJSON = await response.json();
  console.log(responseJSON);
  const id = responseJSON?.id;
  if (!id) return "";
  console.log(id);

  //poll https://backend.blockadelabs.com/api/v1/imagine/requests/ every 5s until file_url is not ""
  let file_url = null;
  let retries = 10;

  while (!file_url && retries > 0) {
    retries = retries - 1;

    console.log("waiting for 4s");
    await new Promise((resolve) => setTimeout(resolve, 4000));

    console.log("polling status");
    const response = await fetch(
      `https://backend.blockadelabs.com/api/v1/imagine/requests/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-api-key": `${blockade_key}`,
        },
      }
    );

    console.log("got response");
    const responseJSON = await response.json();
    console.log(responseJSON);
    if (responseJSON?.request.file_url !== "")
      file_url = responseJSON?.request.file_url;
  }

  return file_url;
}
