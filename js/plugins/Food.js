addFood = function(amount=1) {
    return $gameParty.gainIndependentItem($dataItems[248], amount, false);
};

createFood = function(ingredients) {
    const item = addFood()[0];
    item.ingredients = [];
    let name = "";
    let icons = [];
    for (const ingredient of ingredients) {
        item.ingredients.push(ingredient.id);
        item.infoTextBottom += `\\c[8] - \\ii[${ingredient.id}]\n`;
        name += ingredient.name + " ";
        icons.push(ingredient.iconIndex);
        item.effects = item.effects.concat(ingredient.effects);
        item.price += ingredient.price;
    }
    ItemManager.setPriorityName(item, name.trim());
    ItemManager.updateItemName(item);
    item.iconIndex = icons[Math.floor(Math.random() * icons.length)];
    return item;
};

createRandomFood = function(amount=1) {
    for (var i = 0; i < amount; i++) {
        let ingredients = [];
        for (var j = 0; j <= Math.ceil(Math.random() * 4); j++) ingredients.push(getRandomIngredient());
        createFood(ingredients);
    }
};

getRandomIngredient = function() {
    const ingredients = $dataItems.filter(i => i && i.itemCategory.contains('Ingredients'));
    return ingredients[Math.floor(Math.random() * ingredients.length)]
};

numMeals = function() {
    return $gameParty.items().filter(i => i && DataManager.isIndependent(i) && i.itemCategory.contains('Meals')).length;
};