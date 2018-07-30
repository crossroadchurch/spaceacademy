from PIL import Image

def crop(image_path, coords, saved_location):
    """
    @param image_path: The path to the image to edit
    @param coords: A tuple of x/y coordinates (x1, y1, x2, y2)
    @param saved_location: Path to save the cropped image
    """
    image_obj = Image.open(image_path)
    cropped_image = image_obj.crop(coords)
    cropped_image.save(saved_location)

if __name__ == '__main__':

    image = 'html/assets/venus/venus_surface_full.jpg'
    for i in range(20):
        print(i)
        crop(image, (0, 200*(19-i), 2000, 200*(20-i)), 'html/assets/venus/venus_surface_slice'+str(i)+'.jpg')