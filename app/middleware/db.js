const {
  buildSuccObject,
  buildErrObject,
  itemNotFound,
  itemAlreadyExists,
  itemReferenceExists
} = require('../middleware/utils')

/**
 * Builds sorting
 * @param {string} sort - field to sort from
 * @param {number} order - order for query (1,-1)
 */
const buildSort = (sort, order) => {
  const sortBy = {}
  sortBy[sort] = order
  return sortBy
}

/**
 * Hack for mongoose-paginate, removes 'id' from results
 * @param {Object} result - result object
 */
const cleanPaginationID = result => {
  result.docs.map(element => delete element.id)
  return result
}

/**
 * Builds initial options for query
 * @param {Object} query - query object
 */
const listInitOptions = async req => {
  return new Promise(resolve => {
    const order = req.query.order || -1
    const sort = req.query.sort || 'createdAt'
    const sortBy = buildSort(sort, order)
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 5
    const populate = req.query.populate
    const options = {
      // sort: sortBy,
      // lean: true,
      // page,
      // limit,
      // populate,
      pagination: false
    }
    resolve(options)
  })
}

module.exports = {
  /**
   * Checks the query string for filtering records
   * query.filter should be the text to search (string)
   * query.fields should be the fields to search into (array)
   * @param {Object} query - query object
   */
  async checkQueryString(query) {
    return new Promise((resolve, reject) => {
      try {
        if (
          typeof query.filter !== 'undefined' &&
          typeof query.fields !== 'undefined'
        ) {
          const data = {
            $or: []
          }
          const array = []
          // Takes fields param and builds an array by splitting with ','
          const arrayFields = query.fields.split(',')
          // Adds SQL Like %word% with regex
          arrayFields.map(item => {
            array.push({
              [item]: {
                $regex: new RegExp(query.filter, 'i')
              }
            })
          })
          // Puts array result in data
          data.$or = array
          resolve(data)
        } else {
          resolve({})
        }
      } catch (err) {
        console.log(err.message)
        reject(buildErrObject(422, 'ERROR_WITH_FILTER'))
      }
    })
  },

  /**
   * Gets items from database
   * @param {Object} req - request object
   * @param {Object} query - query object
   */
  async getItems(req, model, query) {
    const options = await listInitOptions(req)
    return new Promise((resolve, reject) => {
      // model.paginate(query, options, (err, items) => {
      //   if (err) {
      //     reject(buildErrObject(422, err.message))
      //   }
      //   resolve(cleanPaginationID(items))
      // })
      
      let finalQuery;
      if (req.query.populate) {
        finalQuery = model.find(query).populate(req.query.populate)
      }
      else {
        finalQuery = model.find(query)
      }
      finalQuery.exec((err, items) => {
        if (err) {
          reject(buildErrObject(422, err.message))
        }
        resolve(items)
      })
    })
  },

  /**
   * Gets item from database by sorting and limiting items
   */
  async sortAndLimitItems(filter , model) {
    const { sort = 'desc', limit = 10 } = filter;
    const sortValue = sort === 'desc' ? -1 : 1;
    return new Promise((resolve, reject) => {
      model.find({ deleted_date: { $eq: null } })
      .sort({ created_date: sortValue })
      .limit(limit).exec((err, offers) => {
        if (err) {
          itemNotFound(err, offers, reject, 'EMPTY_DB');
        }
        resolve(offers);
      })
    })
  },



  /**
   * Gets item from database by id
   * @param {string} id - item id
   */
  async getItem(id, model) {
    return new Promise((resolve, reject) => {
      model.findOne({ _id: id, deleted: { $ne: true } }, (err, item) => {
        itemNotFound(err, item, reject, 'NOT_FOUND')
        resolve(item)
      })
    })
  },

  async getExistedItem(id, model) {
    return new Promise((resolve, reject) => {
      model.findOne({ _id: id }, (err, item) => {
        itemNotFound(err, item, reject, 'NOT_FOUND')
        resolve(item)
      })
    })
  },

  async getDynamicItem(fields, model) {
    return new Promise((resolve, reject) => {
      model.findOne(fields, (err, item) => {
        itemNotFound(err, item, reject, 'NOT_FOUND')
        resolve(item)
      })
    })
  },

  /**
   * Creates a new item in database
   * @param {Object} req - request object
   */
  async createItem(req, model) {
    return new Promise((resolve, reject) => {
      model.create(req, (err, item) => {
        if (err) {
          reject(buildErrObject(422, err.message))
        }
        resolve(item)
      })
    })
  },

  /**
   * Updates an item in database by id
   * @param {string} id - item id
   * @param {Object} req - request object
   */
  async updateItem(id, model, req) {
    return new Promise((resolve, reject) => {
      model.findByIdAndUpdate(
        id,
        req.body,
        {
          //This object will return updated object iof we include 
          //this object in our "findByIdAndUpdate"
          new: true,

        },
        (err, item) => {
          itemNotFound(err, item, reject, 'NOT_FOUND')
          resolve(item)
        }
      )
    })
  },


  /**
 * Updates an item in the array of the model
 * @param {Object} query - query
 * @param {string} model - model
 * @param {Object} updates - request object
 */
  async updateItemWithQuery(query, model, updates) {
    return new Promise((resolve, reject) => {
      model.findOneAndUpdate(
        query,
        updates,
        {
          //This object will return updated object iof we include 
          //this object in our "findByIdAndUpdate"
          new: true,

        },
        (err, item) => {
          itemNotFound(err, item, reject, 'NOT_FOUND')
          resolve(item)
        }
      )
    })
  },

  /**
 * Update items with query
 * @param {Object} query - query
 * @param {string} model - model
 * @param {Object} updates - request object
 */
  async updateItemsWithQuery(query, model, updates) {
    return new Promise((resolve, reject) => {
      model.updateMany(
        query,
        updates,
        {
          //This object will return updated object iof we include 
          //this object in our "findByIdAndUpdate"
          new: true,

        },
        (err, item) => {
          itemNotFound(err, item, reject, 'NOT_FOUND')
          resolve(item)
        }
      )
    })
  },

  /**
   * Deletes an item from database by id
   * @param {string} id - id of item
   */
  async deleteItem(id, model) {
    return new Promise((resolve, reject) => {
      model.findByIdAndUpdate(id, { deleted: true, deletedAt: Date.now() }, (err, item) => {
        itemNotFound(err, item, reject, 'NOT_FOUND')
        resolve(buildSuccObject('DELETED'))
      })
    })
  },

  /**
    * Gets all items from database
    * @param {Object} req - request object
    * @param {Object} query - query object
    */
  async getAllItems(req, model, query) {
    return new Promise((resolve, reject) => {

      model.find({ ...query, deleted: { $ne: true } }, (err, items) => {
        if (err) {
          reject(buildErrObject(422, err.message))
        }
        resolve(items)
      })
    })
  },


  /**
   * Gets item from database prepopulated
   * @param {string} id - item id
   */
  async getPopulatedItem(id, model, fieldToPopulate) {
    return new Promise((resolve, reject) => {
      model.findOne({ id: id.toString(), isdeleted: { $ne: true } }).exec((err, item) => {
        if (item) {
          resolve(item)
        }
        else {
          itemNotFound(err, null, reject, 'NOT_FOUND')
        }
      })
    })
  },

    /**
   * Gets item from database prepopulated
   * @param {string} item - item dynamic value
   */
     async fetchItem(item, model) {
      const { name, value } = item;
      return new Promise((resolve, reject) => {
        model.findOne({ [name]: value.toString(), deleted_date: { $eq: null } }).exec((err, item) => {
          if (item) {
            resolve(item)
          }
          else {
            itemNotFound(err, null, reject, 'NOT_FOUND')
          }
        })
      })
    },

  /**
    * Check an value by field if exist
    * @param {string} params - contain field with value
  */
  async checkItemExists(field, model) {
    return new Promise((resolve, reject) => {
      model.findOne(
        field,
        (err, item) => {
          itemAlreadyExists(err, item, reject, `${Object.keys(field)[0]} already exists.`)
          resolve(false)
        }
      )
    })
  },


  /**
   * Checks if a item already exists excluding itself
   * @param {string} id - id of item
   * @param {string} params - contain field with value
  */
  async itemExistsExcludingItself(id, field, model) {
    return new Promise((resolve, reject) => {
      model.findOne(
        {
          ...field,
          _id: {
            $ne: id
          }
        }
        ,
        (err, item) => {
          itemAlreadyExists(err, item, reject, `${Object.keys(field)[0]} already exists.`)
          resolve(false)
        }
      )
    })
  },

  async getModelCount(query, model) {
    return new Promise((resolve, reject) => {
      model.countDocuments(query, (err, items) => {
        if (err) {
          reject(buildErrObject(422, err.message))
        }
        resolve(items)
      })
    })
  },

  /**
   * Checks if a item already exists excluding itself
   * @param {string} id - id of item
   * @param {string} params - contain field with value
  */
  async itemRefExists(id, field, model) {
    return new Promise((resolve, reject) => {
      model.findOne(
        {
          ...field
        },
        (err, item) => {
          itemReferenceExists(err, item, reject, `References exists for this entity.`)
          resolve(false)
        }
      )

    })
  },
  /**
* Updates an item with a query and insert it if it is not found
* @param {Object} query - query
* @param {string} model - model
* @param {Object} updates - request object
*/
  async upsertItemWithQuery(query, model, updates) {
    return new Promise((resolve, reject) => {
      model.findOneAndUpdate(
        query,
        updates,
        {
          //This object will return updated object iof we include 
          //this object in our "findByIdAndUpdate"
          new: true,
          upsert: true

        },
        (err, item) => {
          if (err) {
            console.log("error " + JSON.stringify(err))
            itemNotFound(err, item, reject, 'NOT_FOUND')
          }
          resolve(item)
        }
      )
    })
  },
}