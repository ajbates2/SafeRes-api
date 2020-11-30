const RestaurantService = {
    getRestaurantData(db, restaurant_id) {
        return db
            .from('saferes_restaurant as rest')
            .where({ id: restaurant_id })
            .select(
                'rest.restaurant_name'
            )
    }
}