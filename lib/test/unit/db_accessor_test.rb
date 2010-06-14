require 'shogi'
require 'test/unit'
require 'rack/test'

LOGGER = Logger.new("log/test_db_accessor.log")

class DbAccessorTest < Test::Unit::TestCase

  def test_regist_board
    delete_move({'from'=>13,'bid'=>20,'piece'=>'p','promote'=>'f','to'=>14})
    delete_board({ 'black'=>'','board'=>'lxxpxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxPxxSnrpxxxPBNlxpxxxPxL','turn'=>'t','white'=>''})
    param = { 'level' => 3,'range' => 'full', 'black'=>'','board'=>'lxxpxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxPxxSnrpxxxPBNlxpxxxPxL','from'=>13,'oldbid'=>20,'piece'=>'p','promote'=>'f','to'=>14,'turn'=>'t','white'=>''}
    dbA = DbAccessor.new(param, LOGGER)
    res = dbA.regist_board
    unpacked = MessagePack.unpack res
    LOGGER.debug(unpacked.inspect)
    assert unpacked.size > 0
    assert unpacked['board'][0]['bid'] == unpacked['prevMoves'][0]['nxt_bid']
  end

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

end  # of class DbAccessorTest

=begin
  def test_get_msg
    get '/getMsg',{ 'bid' => 1 , 'uid' =>1, 'level' => 3, 'mask' => 15, 'range' => 'full' }
    assert last_response.ok?
    assert last_response.body.include?('bid')
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
    assert last_response.body.include?('bid')
  end
end
=end
