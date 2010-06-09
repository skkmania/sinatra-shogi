  require 'logger'
  require 'sequel'

  # localhostへの接続
  DB = Sequel.connect("postgres://skkmania:skkmania@localhost:5432/shogi84",
    :max_connections => 10, :logger => Logger.new('log/db.log'))

=begin
  dataset = DB['select bid from boards where bid < 10']
  puts dataset.count # will return the number of records in the result set
  # 列のデータの取得
  puts dataset.map(:bid).join(',')
  # 複数列のデータの取得
  #dataset = DB['select bid,board from boards where bid < 10']
  #puts dataset.map([:bid, :board]).join(',')
  DB['select * from boards where bid < 10'].each do |row|
    p row
  end
  puts
  # 絞り込む条件を変数で与える
  bid = 3
  DB['select * from boards where bid = ?', bid].each do |row|
    p row
  end
  puts
  # 絞り込む条件を複数の変数で与える
  bid2 = 10
  DB['select * from boards where bid > ? and bid < ?', bid, bid2].each do |row|
    p row
  end
  puts

  #Getting Dataset Instances
  boards = DB.from(:boards)
  # 全データ これは select * from boards; とやるのと同じ
  #p boards.all
  # first data
  p boards.first

  # データ構造の配列の配列を返す
  # [[カラム名、カラムのタイプなどのハッシュ], .. 全カラム分 .. ]
  # ハッシュのkey 
  # {:type, :allow_null, :ruby_default, :db_type, :default, :primary_key }
  p DB.schema(:boards)
  puts

  # filter
  null_bids = boards.filter('bid IS NULL')
  puts null_bids.count
  puts 


Datasets will only fetch records when you tell them to. They can be manipulated to filter records, change ordering, join tables, etc..

Retrieving Records
You can retrieve all records by using the all method:


You can also iterate through records one at a time:

  posts.each{|row| p row}
Or perform more advanced stuff:

  names_and_dates = posts.map{|r| [r[:name], r[:date]]}
  old_posts, recent_posts = posts.partition{|r| r[:date] < Date.today - 7}
You can also retrieve the first record in a dataset:

  posts.first
  # SELECT * FROM posts LIMIT 1
Or retrieve a single record with a specific value:

  posts[:id => 1]
  # SELECT * FROM posts WHERE id = 1 LIMIT 1
If the dataset is ordered, you can also ask for the last record:

  posts.order(:stamp).last
  # SELECT * FROM posts ORDER BY stamp DESC LIMIT 1
Filtering Records
An easy way to filter records is to provide a hash of values to match:

  my_posts = posts.filter(:category => 'ruby', :author => 'david')
  # WHERE category = 'ruby' AND author = 'david'
You can also specify ranges:

  my_posts = posts.filter(:stamp => (Date.today - 14)..(Date.today - 7))
  # WHERE stamp >= '2010-06-30' AND stamp <= '2010-07-07'
Or arrays of values:

  my_posts = posts.filter(:category => ['ruby', 'postgres', 'linux'])
  # WHERE category IN ('ruby', 'postgres', 'linux')
Sequel also accepts expressions:

  my_posts = posts.filter{|o| o.stamp > Date.today << 1}
  # WHERE stamp > '2010-06-14'
Some adapters will also let you specify Regexps:

  my_posts = posts.filter(:category => /ruby/i)
  # WHERE category ~* 'ruby'
You can also use an inverse filter:

  my_posts = posts.exclude(:category => /ruby/i)
  # WHERE category !~* 'ruby'
You can also specify a custom WHERE clause using a string:

  posts.filter('stamp IS NOT NULL')
  # WHERE stamp IS NOT NULL
You can use parameters in your string, as well:

  author_name = 'JKR'
  posts.filter('(stamp < ?) AND (author != ?)', Date.today - 3, author_name)
  # WHERE (stamp < '2010-07-11') AND (author != 'JKR')
  posts.filter{|o| (o.stamp < Date.today - 3) & ~{:author => author_name}} # same as above
Datasets can also be used as subqueries:

  DB[:items].filter('price > ?', DB[:items].select{|o| o.avg(:price) + 100})
  # WHERE price > (SELECT avg(price) + 100 FROM items)
After filtering you can retrieve the matching records by using any of the retrieval methods:

  my_posts.each{|row| p row}
See the doc/dataset_filtering.rdoc file for more details.
=end
#You can specify a block to connect, which will disconnect from the database after it completes:

#  Sequel.connect('postgres://cico:12345@localhost:5432/mydb'){|db| db[:posts].delete}
=begin
Arbitrary SQL queries
You can execute arbitrary SQL code using Database#run:

  DB.run("create table t (a text, b text)")
  DB.run("insert into t values ('a', 'b')")
You can also create datasets based on raw SQL:

  dataset = DB['select id from items']
  dataset.count # will return the number of records in the result set
  dataset.map(:id) # will return an array containing all values of the id column in the result set
=end
