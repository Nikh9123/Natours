class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //TODO: BUILD QUERY
    //*[1A]  FILTERING 🧹🧹🧹🧹🧹🧹

    const queryObj = { ...this.queryString };
    const excludedFields = ['fields', 'page', 'sort', 'limit'];
    excludedFields.forEach((el) => delete queryObj[el]);

    //*[1B] : ADVANCE FILTERING(GREATER THAN , LESS THAN

    let queryString = JSON.stringify(queryObj);
    console.log(queryString);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(queryString));
    // let query = Tour.find(JSON.parse(queryString));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      console.log(sortBy);
      // sort(price , ratingsAverage)
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort(-'createdAT');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      // console.log("😍😍😍😍",fields)
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    const pageVal = this.queryString.page * 1 || 1;
    const limitVal = this.queryString.limit * 1 || 100;
    // console.log("->>->>->>",pageVal , limitVal)
    const skipVal = (pageVal - 1) * limitVal;
    // console.log(skipVal)
    this.query = this.query.skip(skipVal).limit(limitVal);
    return this;
  }

  numberToMonth(number) {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    return months[number - 1];
  }
}

module.exports = APIFeatures;
