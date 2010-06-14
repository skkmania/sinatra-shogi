require 'shogi'
require 'test/unit'
require 'rack/test'

set :environment, :test

class ShogiTest < Test::Unit::TestCase
  include Rack::Test::Methods

  def app
    Sinatra::Application
  end

  def test_it_says_hi
    get '/hi'
    assert last_response.ok?
    assert_equal 'Hello World!', last_response.body
  end

  def test_it_says_hello_to_a_person
    get '/hello/Simon'
    #get '/hello/:name', :name => 'Simon'
    assert last_response.ok?
    assert last_response.body.include?('Simon')
  end

  def test_it_does_not_say_hello_to_a_person
    # pathを求めているのにparamsを渡してもダメな例
    get '/hello', { :name => 'Simon' }
    #get '/hello/:name', :name => 'Simon'
    assert !last_response.ok?
  end

  def test_it_says_hello_to_a_person_with_params
    get '/helloP', { :name => 'Simon' }
    assert last_response.ok?
    assert last_response.body.include?('Simon')
  end

  def test_get_msg
    get '/getMsg',{ 'bid' => 1 , 'uid' =>1, 'level' => 3, 'mask' => 15, 'range' => 'full' }
    assert last_response.ok?
    assert last_response.body.include?('bid')
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
