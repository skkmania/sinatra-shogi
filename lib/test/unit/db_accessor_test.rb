require 'rubygems'
require 'shogi.rb'
require 'test/unit'
require 'mocha'

class DbAccessorTest < Test::Unit::TestCase

  @@logger = Logger.new('log/db_accessor_test.log')

  def delete_board(b)
    query = "delete from boards where board = '#{b['board']}' \
             and white = '#{b['white']}' and black = '#{b['black']}' and turn = '#{b['turn']}'"
    DB[query].all
  end

  def delete_move(m)
    query = "delete from moves where bid = #{m['bid']} and \
             m_from = #{m['from']} and m_to = #{m['to']} and \
             piece = '#{m['piece']}' and promote = '#{m['promote']}'"
    DB[query].all
  end
  # post bidには２つの機能がある。それぞれを以下でテストする
  # なぜこんなことになっているか
  #   board情報をDBに投げてみないと、それが新規か既存かわからない
  #   そしてわかった時点ではじめて行える動作が決まる
  def test_post_bid_existed
    # 既存の局面に新手を登録するテスト
    # testを繰り返すため、testのたびに、この手をDBから削除しておく
    delete_move({'from'=>13,'bid'=>20,'piece'=>'p','promote'=>'f','to'=>14})
    post '/bid', { 'level' => 3, 'range' => 'full','black'=>'','board'=>'lxxpxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxPxxSnrpxxxPBNlxpxxxPxL','from'=>13,'oldbid'=>20,'piece'=>'p','promote'=>'f','to'=>14,'turn'=>'t','white'=>''}
    assert last_response.ok?
    assert last_response.body.include?('bid')
  end

  def test_post_bid_new
    # 新規の局面と,それに至る新手を既存の局面に登録するテスト
    # testを繰り返すため、testのたびに、この局面と手をDBから削除しておく
    # 制約条件から、先にmoveを消すこと
    delete_move({'from'=>13,'bid'=>20,'piece'=>'p','promote'=>'f','to'=>14})
    delete_board({ 'black'=>'','board'=>'lxxpxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxPxxSnrpxxxPBNlxpxxxPxL','turn'=>'t','white'=>''})
    post '/bid', { 'level' => 3,'range' => 'full', 'black'=>'','board'=>'lxxpxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxPxxSnrpxxxPBNlxpxxxPxL','from'=>13,'oldbid'=>20,'piece'=>'p','promote'=>'f','to'=>14,'turn'=>'t','white'=>''}
    assert last_response.ok?
    assert MessagePack.unpack(last_response.body)['prevMoves'][0]['m_from'] == "13"
    assert MessagePack.unpack(last_response.body)['prevMoves'][0]['m_to'] == "14"
    assert MessagePack.unpack(last_response.body)['prevMoves'][0]['promote'] == "f"
  end

  def test_send_query
    params = { 'kid' => 1 }
    dba = DbAccessor.new(params, @@logger)
    result = dba.send_query('select 1 as one;')
    puts result.inspect
    assert_equal 1, result.size
  end

  def test_get_kifs_data
    params = { 'kid' => 1 }
    dba = DbAccessor.new(params, @@logger)
    result = dba.send_query('select * from kifs where kid = 1;')
    puts result.inspect
    assert_equal 1, result.size
  end

  def test_get_book
    params = { 'kid' => 1 }
    dba = DbAccessor.new(params, @@logger)
    assert_equal  "select * from get_book_with_meta(1);", dba.queries['book']
    res = MessagePack.unpack(dba.get_book)
    puts res.inspect
    assert res.size > 0
    assert_equal 1,   res[0]["kid"]
    assert_equal 126, res[0]["tesu"]
    assert_equal 'w', res[0]["result"]
    assert_equal 126, res[0]["kif"].split(':').size
    assert_equal '羽生善治', res[0]["black"]
    assert_equal '谷川浩司', res[0]["white"]
    assert_equal '2003-09-08', res[0]["gdate"]
  end
=begin
  def test_post_book
    param = [[77,76,'P',false],[33,34,'p',false]]
    m = MessagePack.pack(param)
    DB.stubs(:[]).returns(param)
    Array.any_instance.stubs(:all).returns(param)
    post '/book', { 'moves' => m, 'player1' => 'sente', 'player2' => 'gote',
                    'win' => 1, 'date' => '2010/5/5' }
    assert last_response.ok?
    assert MessagePack.unpack(last_response.body)[0][0] == 77
    #assert MessagePack.unpack(last_response.body)['player1'] == "sente"
    #assert MessagePack.unpack(last_response.body)['player2'] == "gote"
  end
=end
  def test_post_book
    params = { 'text' => File.open("/home/skkmania/Dropbox/shogi/kif/vs3ken/2009051801-fiasco-kati.kif","r").readlines.join }
    dba = DbAccessor.new(params, @@logger)
    res = MessagePack.unpack(dba.post_book)
    puts res.inspect
    assert res.size > 0
    # assert_equal 1,   res[0]["kid"]
    assert_equal  72, res[0]["tesu"]
    assert_equal 'w', res[0]["result"]
  end
end
