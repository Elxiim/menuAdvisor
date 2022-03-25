export const convertImgToBase64URL = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], 'image.jpg', { type: blob.type });
    console.log(file);
    return file;
}
